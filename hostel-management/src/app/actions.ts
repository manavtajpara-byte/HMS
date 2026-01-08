'use server';

import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const { signIn } = await import("@/auth");
        await signIn('credentials', formData);
    } catch (error) {
        if ((error as Error).message.includes('CredentialsSignin')) {
            return 'CredentialSignin';
        }
        throw error;
    }
}

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const homeTown = formData.get("homeTown") as string;
    const degree = formData.get("degree") as string;
    const yearOfDegree = formData.get("yearOfDegree") as string;
    const contactNumber = formData.get("contactNumber") as string;
    const fullName = formData.get("fullName") as string;
    const image = formData.get("image") as string;
    const address = formData.get("address") as string;
    const gender = formData.get("gender") as string;
    const guardianContact = formData.get("guardianContact") as string;

    await db.user.update({
        where: { id: session.user.id },
        data: {
            name: fullName || undefined,
            image: image || undefined,
            profile: {
                upsert: {
                    create: {
                        homeTown,
                        degree,
                        yearOfDegree,
                        contactNumber,
                        address,
                        gender,
                        guardianContact,
                        fullName
                    },
                    update: {
                        homeTown,
                        degree,
                        yearOfDegree,
                        contactNumber,
                        address,
                        gender,
                        guardianContact,
                        fullName
                    }
                }
            }
        }
    });

    revalidatePath("/student");
    revalidatePath("/rector");
    revalidatePath("/student/profile/" + session.user.id);
    revalidatePath("/rector/profile");
    revalidatePath("/student/directory");
}

export async function votePoll(pollId: string, optionId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Check if already voted
    const existingVote = await db.pollResponse.findFirst({
        where: {
            pollId,
            studentId: session.user.id
        }
    });

    if (existingVote) {
        return;
    }

    await db.pollResponse.create({
        data: {
            pollId,
            pollOptionId: optionId,
            studentId: session.user.id
        }
    });

    revalidatePath("/student");
}

export async function submitMessSuggestion(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const text = formData.get("text") as string;
    if (!text || text.trim().length === 0) return;

    await db.messSuggestion.create({
        data: {
            text,
            studentId: session.user.id
        }
    });

    revalidatePath("/student");
    revalidatePath("/rector");
}

export async function toggleMealOptOut(mealType: "LUNCH" | "DINNER") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db.mealOptOut.findFirst({
        where: {
            studentId: session.user.id,
            mealType,
            date: today
        }
    });

    if (existing) {
        await db.mealOptOut.delete({ where: { id: existing.id } });
    } else {
        await db.mealOptOut.create({
            data: {
                studentId: session.user.id,
                mealType,
                date: today
            }
        });
    }

    revalidatePath("/student");
    revalidatePath("/rector");
}

export async function allocateRoom(formData: FormData) {
    try {
        const session = await auth();
        if (session?.user?.role !== "RECTOR") throw new Error("Unauthorized");

        const studentId = formData.get("studentId") as string;
        const roomId = formData.get("roomId") as string;

        console.log("Allocating room:", { studentId, roomId });

        if (!studentId || !roomId) {
            console.error("Missing studentId or roomId");
            return;
        }

        // Check capacity
        const room = await db.room.findUnique({
            where: { id: roomId },
            include: { occupants: true }
        });

        if (!room) {
            console.error("Room not found:", roomId);
            throw new Error("Room not found");
        }

        console.log("Room found:", room.number, "Current occupants:", room.occupants.length);

        if (room.occupants.length >= room.capacity) {
            console.error("Room is full");
            throw new Error("Room is full");
        }

        // Assign Room (Use upsert in case profile doesn't exist yet)
        await db.profile.upsert({
            where: { userId: studentId },
            update: {
                roomId: roomId,
                roomNumber: room.number
            },
            create: {
                userId: studentId,
                roomId: roomId,
                roomNumber: room.number,
                hostelName: "Main Hostel"
            }
        });

        revalidatePath("/rector");
        revalidatePath("/rector/students");
        revalidatePath("/student");
        revalidatePath("/student/directory");
        if (studentId) revalidatePath("/student/profile/" + studentId);
    } catch (error) {
        console.error("Error in allocateRoom:", error);
        throw error;
    }
}


export async function createAnnouncement(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title || !content) return;

    await (db as any).announcement?.create({
        data: {
            title,
            content,
            authorId: session.user.id!
        }
    });

    revalidatePath("/student");
    revalidatePath("/rector");
}

export async function deleteUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") throw new Error("Unauthorized");

    const userId = formData.get("userId") as string;
    if (!userId) return;

    await db.user.delete({
        where: { id: userId }
    });

    revalidatePath("/rector");
    revalidatePath("/rector/students");
}

export async function registerUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") throw new Error("Unauthorized");

    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string || "STUDENT";

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('welcome123', 10);

    await db.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role,
            profile: {
                create: { hostelName: "Main Hostel" }
            }
        }
    });

    revalidatePath("/rector");
    revalidatePath("/rector/students");
}

export async function signUp(
    prevState: string | undefined,
    formData: FormData,
) {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;

    if (!email || !name || !password) {
        return "All fields are required.";
    }

    if (password.length < 6) {
        return "Password must be at least 6 characters.";
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: "STUDENT",
                profile: {
                    create: { hostelName: "Main Hostel" }
                }
            }
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return "Email already exists.";
        }
        console.error("Signup error:", error);
        return "Failed to create account.";
    }

    redirect("/login?signup=success");
}

export async function handleLogout() {
    await signOut({ redirectTo: "/login" });
}

export async function setRoomPrice(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") throw new Error("Unauthorized");

    const roomId = formData.get("roomId") as string;
    const price = parseFloat(formData.get("price") as string);

    if (!roomId || isNaN(price)) return;

    await db.room.update({
        where: { id: roomId },
        data: { price: Number(price) } as any
    });

    revalidatePath("/rector");
    revalidatePath("/student");
}

export async function requestMessHoliday(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") throw new Error("Unauthorized");

    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    if (!startDate || !endDate) return;

    await (db as any).messHoliday?.create({
        data: {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            studentId: session.user.id!
        }
    });

    revalidatePath("/student");
    revalidatePath("/rector");
}

export async function updateMessHolidayStatus(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") throw new Error("Unauthorized");

    const holidayId = formData.get("holidayId") as string;
    const status = formData.get("status") as string;

    if (!holidayId || !status) return;

    await (db as any).messHoliday?.update({
        where: { id: holidayId },
        data: { status }
    });

    revalidatePath("/rector");
    revalidatePath("/rector/meals");
    revalidatePath("/student");
}

export async function setStudentYearlyFee(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") throw new Error("Unauthorized");

    const studentId = formData.get("studentId") as string;
    const yearlyFee = parseFloat(formData.get("yearlyFee") as string);

    if (!studentId || isNaN(yearlyFee)) return;

    await (db as any).profile.upsert({
        where: { userId: studentId },
        update: { yearlyFee } as any,
        create: {
            userId: studentId,
            hostelName: "Main Hostel",
            yearlyFee
        } as any
    });

    revalidatePath("/rector");
    revalidatePath("/rector/students");
    revalidatePath("/student");
    if (studentId) revalidatePath("/student/profile/" + studentId);
}

export async function submitMealReview(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") throw new Error("Unauthorized");

    const mealType = formData.get("mealType") as string;
    const rating = parseInt(formData.get("rating") as string);
    const comment = formData.get("comment") as string;

    if (!mealType || !rating) return;

    // Time window check (Server Time)
    const now = new Date();
    const currentHour = now.getHours();
    let valid = false;

    // Windows: Breakfast 7-11, Lunch 12-16, Dinner 19-23
    // We log for debugging
    console.log(`Checking meal review window for ${mealType} at hour ${currentHour}`);

    if (mealType === "BREAKFAST" && currentHour >= 7 && currentHour < 11) valid = true;
    if (mealType === "LUNCH" && currentHour >= 12 && currentHour < 16) valid = true;
    if (mealType === "DINNER" && currentHour >= 19 && currentHour < 23) valid = true;

    if (!valid) {
        console.error("Review submission closed for", mealType);
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        await (db as any).mealReview?.create({
            data: {
                studentId: session.user.id!,
                date: today,
                mealType: mealType as "BREAKFAST" | "LUNCH" | "DINNER",
                rating,
                comment
            }
        });

        // --- LOW FOOD QUALITY ALERT ---
        const reviews = await (db as any).mealReview?.findMany({
            where: {
                date: today,
                mealType: mealType as any
            }
        });

        const averageRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

        if (averageRating < 3.0) {
            const rectors = await db.user.findMany({
                where: { role: "RECTOR" }
            });

            for (const rector of rectors) {
                await (db as any).notification?.create({
                    data: {
                        userId: rector.id,
                        title: "Low Food Quality Alert",
                        content: `Average rating for ${mealType} today: ${averageRating.toFixed(1)}/5.0`,
                        type: "SYSTEM",
                        read: false
                    }
                });
            }
        }
        // --------------------------------
    } catch (e) {
        console.error("Error submitting review:", e);
    }

    revalidatePath("/rector");
    revalidatePath("/rector/meals");
    revalidatePath("/student/meals");
}

export async function logMovement(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") throw new Error("Unauthorized");

    const userId = session.user.id!;
    const type = formData.get("type") as "ENTRY" | "EXIT";
    const reason = formData.get("reason") as string | null;

    if (!type) return;

    try {
        await (db as any).entryExitLog?.create({
            data: {
                studentId: userId,
                type,
                reason: reason || null,
            }
        });
    } catch (e) {
        console.error("Error logging movement:", e);
    }

    revalidatePath("/student");
    revalidatePath("/rector");
}
export async function submitRoomChangeRequest(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") throw new Error("Unauthorized");

    const requestedRoomId = formData.get("requestedRoomId") as string;
    const reason = formData.get("reason") as string;

    if (!requestedRoomId || !reason) return;

    try {
        await (db as any).roomChangeRequest?.create({
            data: {
                studentId: session.user.id!,
                requestedRoomId,
                reason,
            }
        });
    } catch (e) {
        console.error("Error submitting room change request:", e);
    }

    revalidatePath("/student");
    revalidatePath("/student/profile/" + session.user.id);
    revalidatePath("/rector");
    revalidatePath("/rector/profile");
}

export async function handleRoomChangeRequest(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") throw new Error("Unauthorized");

    const requestId = formData.get("requestId") as string;
    const status = formData.get("status") as "APPROVED" | "REJECTED";
    const rectorMessage = formData.get("rectorMessage") as string;

    if (!requestId || !status) return;

    try {
        const request = await (db as any).roomChangeRequest?.findUnique({
            where: { id: requestId },
            include: { student: true, requestedRoom: true }
        });

        if (!request) throw new Error("Request not found");

        if (status === "APPROVED") {
            // Update student's room
            await db.profile.update({
                where: { userId: request.studentId },
                data: {
                    roomId: request.requestedRoomId,
                    roomNumber: request.requestedRoom.number
                }
            });
        }

        // Update request status and message
        await (db as any).roomChangeRequest?.update({
            where: { id: requestId },
            data: {
                status,
                rectorMessage: rectorMessage || null
            }
        });

        // Create Notification for the student
        await db.notification.create({
            data: {
                userId: request.studentId,
                title: `Room Change Request ${status === 'APPROVED' ? 'Accepted' : 'Rejected'}`,
                message: rectorMessage || `Your request for Room ${request.requestedRoom.number} has been ${status.toLowerCase()}.`,
                type: status === 'APPROVED' ? 'SUCCESS' : 'ERROR',
            }
        });

    } catch (e) {
        console.error("Error handling room change request:", e);
    }

    revalidatePath("/rector");
    revalidatePath("/rector/room-requests");
    revalidatePath("/student");
}

export async function updateHostelName(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") {
        console.error("Unauthorized: User is not a rector");
        throw new Error("Unauthorized");
    }

    const hostelName = formData.get("hostelName") as string;
    const upiId = formData.get("upiId") as string;
    const merchantName = formData.get("merchantName") as string;

    console.log("Updating hostel settings:", { hostelName, upiId, merchantName });

    if (!hostelName || hostelName.trim().length === 0) {
        console.error("Hostel name is empty");
        throw new Error("Hostel name is required");
    }

    try {
        const result = await (db as any).hostelSettings?.upsert({
            where: { id: "default" },
            update: {
                hostelName: hostelName.trim(),
                upiId: upiId?.trim() || null,
                merchantName: merchantName?.trim() || null,
                updatedBy: session.user.id,
            },
            create: {
                id: "default",
                hostelName: hostelName.trim(),
                upiId: upiId?.trim() || null,
                merchantName: merchantName?.trim() || null,
                updatedBy: session.user.id,
            },
        });
        console.log("Hostel settings updated successfully:", result);
    } catch (error) {
        console.error("Error updating hostel settings:", error);
        throw error;
    }

    revalidatePath("/");
    revalidatePath("/login");
    revalidatePath("/rector");
    revalidatePath("/student");
    revalidatePath("/student/fees");
    revalidatePath("/rector/fees");
    console.log("Paths revalidated");
}

export async function deleteAnnouncement(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") throw new Error("Unauthorized");

    const id = formData.get("announcementId") as string;
    if (!id) return;

    try {
        await (db as any).announcement?.delete({
            where: { id }
        });
    } catch (e) {
        console.error("Error deleting announcement:", e);
    }

    revalidatePath("/student");
    revalidatePath("/rector");
}
export async function createRector(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const rectorId = `RECTOR-${year}-${random}`;

    // For compatibility with the current login system which requires email, 
    // we use the generated ID as the email prefix.
    const email = `${rectorId.toLowerCase()}@hms.com`;

    // Generate a secure temporary password
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.user.create({
            data: {
                name,
                email, // This is the ID used for login
                password: hashedPassword,
                role: "RECTOR",
                profile: {
                    create: {
                        fullName: name,
                    }
                }
            }
        });

        revalidatePath("/admin/rectors");
        return { success: true, rectorId: email, password };
    } catch (error) {
        console.error("Error creating rector:", error);
        return { success: false, error: "Failed to create rector. ID might already exist." };
    }
}

export async function applyMessHoliday(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") throw new Error("Unauthorized");

    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);

    if (startDate > endDate) {
        throw new Error("Start date must be before end date");
    }

    await (db as any).messHoliday.create({
        data: {
            startDate,
            endDate,
            studentId: session.user.id,
            status: "PENDING"
        }
    });

    revalidatePath("/student/holidays");
}

export async function approveMessHoliday(holidayId: string, status: "APPROVED" | "REJECTED") {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") throw new Error("Unauthorized");

    await (db as any).messHoliday.update({
        where: { id: holidayId },
        data: { status }
    });

    revalidatePath("/rector/holidays");
    revalidatePath("/student/holidays");
}

export async function markNotificationAsRead(notificationId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await (db as any).notification.update({
        where: { id: notificationId },
        data: { read: false } // Default state is actually usually read = true when marking
    });

    revalidatePath("/rector");
}
