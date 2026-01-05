import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { submitRoomChangeRequest, updateProfile, allocateRoom, setStudentYearlyFee } from "../../../actions";
import { ImageUpload } from "@/components/ImageUpload";

export default async function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || (session.user.role !== "STUDENT" && session.user.role !== "RECTOR")) {
        redirect("/login");
    }

    const { id } = await params;

    const studentData = await db.user.findUnique({
        where: { id },
        include: {
            profile: { include: { room: true } },
            roomChangeRequests: {
                include: { requestedRoom: true },
                orderBy: { createdAt: 'desc' }
            },
            entryExitLogs: {
                orderBy: { timestamp: 'desc' },
                take: 5
            },
            mealReviews: {
                orderBy: { createdAt: 'desc' },
                take: 5
            }
        }
    });

    if (!studentData || studentData.role !== "STUDENT") {
        redirect(session.user.role === "RECTOR" ? "/rector/students" : "/student/directory");
    }

    const isOwnProfile = studentData.id === session.user.id;
    const isRector = session.user.role === "RECTOR";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Student Profile</h1>
                    <p className="text-gray-500 mt-1">
                        {isOwnProfile ? "Manage your personal information" : `Viewing ${studentData.name}'s Profile`}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/student/directory"
                        className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                    >
                        Back to Directory
                    </Link>
                    {isOwnProfile && (
                        <Link
                            href="/student"
                            className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-md text-sm font-medium transition-colors"
                        >
                            Edit Profile
                        </Link>
                    )}
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Banner Section */}
                <div className="bg-black p-8 text-white">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {studentData.image ? (
                                <img
                                    src={studentData.image}
                                    alt={studentData.name || 'Student'}
                                    className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
                                />
                            ) : (
                                <div className="p-4 bg-white/10 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{studentData.name}</h2>
                            <p className="text-gray-400 mt-1">{studentData.email}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 border border-white/20 rounded text-xs font-bold uppercase tracking-wider">
                                Registered Student
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Personal Information
                    </h3>

                    {isOwnProfile ? (
                        <form action={updateProfile} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                                    <input
                                        name="fullName"
                                        defaultValue={studentData.profile?.fullName || studentData.name || ''}
                                        className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all"
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Number</label>
                                    <input
                                        name="contactNumber"
                                        defaultValue={studentData.profile?.contactNumber || ''}
                                        className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all"
                                        placeholder="Enter contact number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Home Town</label>
                                    <input
                                        name="homeTown"
                                        defaultValue={studentData.profile?.homeTown || ''}
                                        className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all"
                                        placeholder="Enter home town"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Degree Program</label>
                                    <input
                                        name="degree"
                                        defaultValue={studentData.profile?.degree || ''}
                                        className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all"
                                        placeholder="Enter degree program"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Year of Study</label>
                                    <input
                                        name="yearOfDegree"
                                        defaultValue={studentData.profile?.yearOfDegree || ''}
                                        className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all"
                                        placeholder="Enter year of study"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
                                    <select
                                        name="gender"
                                        defaultValue={studentData.profile?.gender || ''}
                                        className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</label>
                                    <textarea
                                        name="address"
                                        defaultValue={studentData.profile?.address || ''}
                                        rows={2}
                                        className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all resize-none"
                                        placeholder="Enter full address"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guardian Contact</label>
                                    <input
                                        name="guardianContact"
                                        defaultValue={studentData.profile?.guardianContact || ''}
                                        className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all"
                                        placeholder="Enter guardian contact"
                                    />
                                </div>

                                <div className="md:col-span-2 pt-8 border-t border-gray-100">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Profile Photograph</h3>
                                    <ImageUpload name="image" defaultValue={studentData.image} />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-black text-white font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-all rounded shadow-sm"
                                >
                                    Save Profile Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                                <p className="text-black font-medium border-b border-gray-50 pb-2">{studentData.profile?.fullName || studentData.name || 'Not provided'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                <p className="text-black font-medium border-b border-gray-50 pb-2">{studentData.email}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Number</label>
                                <p className="text-black font-medium border-b border-gray-50 pb-2">{studentData.profile?.contactNumber || 'Not provided'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Home Town</label>
                                <p className="text-black font-medium border-b border-gray-50 pb-2">{studentData.profile?.homeTown || 'Not provided'}</p>
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</label>
                                <p className="text-black font-medium border-b border-gray-50 pb-2">{studentData.profile?.address || 'Not provided'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Degree Program</label>
                                <p className="text-black font-medium border-b border-gray-50 pb-2">{studentData.profile?.degree || 'Not provided'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Year of Study</label>
                                <p className="text-black font-medium border-b border-gray-50 pb-2">{studentData.profile?.yearOfDegree || 'Not provided'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
                                <p className="text-black font-medium border-b border-gray-50 pb-2">{studentData.profile?.gender || 'Not provided'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hostel Name</label>
                                <p className="text-black font-medium border-b border-gray-50 pb-2">{studentData.profile?.hostelName || 'Not assigned'}</p>
                            </div>

                            {studentData.profile?.room && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Room Number</label>
                                        <p className="text-black font-medium border-b border-gray-50 pb-2">{studentData.profile.room.number}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Room Type</label>
                                        <p className="text-black font-medium border-b border-gray-50 pb-2">{studentData.profile.room.type.replace('_', ' ')}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Room Change Request Section */}
            {(isOwnProfile || isRector) && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 uppercase tracking-widest text-[10px] font-bold text-gray-500">
                        Room Change Requests
                    </div>

                    <div className="p-8 space-y-8">
                        {/* New Request Form (Student Only) */}
                        {isOwnProfile && (
                            <form action={submitRoomChangeRequest} className="space-y-6 pb-8 border-b border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Requested Room</label>
                                        <select
                                            name="requestedRoomId"
                                            required
                                            className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all appearance-none"
                                        >
                                            <option value="">Choose a vacant room...</option>
                                            {(await db.room.findMany({ include: { occupants: true } }))
                                                .filter(r => r.occupants.length < r.capacity && r.id !== studentData.profile?.roomId)
                                                .map(room => (
                                                    <option key={room.id} value={room.id}>
                                                        Room {room.number} ({room.type.replace('_', ' ')}) - {room.capacity - room.occupants.length} slots left
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason for Change</label>
                                        <textarea
                                            name="reason"
                                            required
                                            placeholder="Explain why you want to change rooms..."
                                            className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all resize-none h-10"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded"
                                    >
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Request History (Visible to Student & Rector) */}
                        {studentData.roomChangeRequests && studentData.roomChangeRequests.length > 0 ? (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Request History</h4>
                                <div className="space-y-4">
                                    {studentData.roomChangeRequests.map((request: any) => (
                                        <div key={request.id} className="p-4 bg-gray-50 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm">Room {request.requestedRoom.number}</span>
                                                    <span className="text-gray-400 text-xs">•</span>
                                                    <span className="text-gray-500 text-xs">{new Date(request.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-600">Reason: <span className="italic">{request.reason}</span></p>
                                                {request.rectorMessage && (
                                                    <div className="mt-2 p-2 bg-white rounded border border-gray-100 flex gap-2 items-start">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black shrink-0 mt-0.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                                        <div className="text-[10px] text-gray-500 italic">"{request.rectorMessage}"</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                                    ${request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                        request.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No room change requests found</p>
                        )}
                    </div>
                </div>
            )}

            {/* Student Activity Logs (Full Profile Access) */}
            {(isOwnProfile || isRector) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Movement History */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 uppercase tracking-widest text-[10px] font-bold text-gray-500">
                            Recent Movement
                        </div>
                        <div className="p-6 space-y-4">
                            {studentData.entryExitLogs.length > 0 ? (
                                <div className="space-y-4">
                                    {studentData.entryExitLogs.map((log: any) => (
                                        <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <div>
                                                <div className="text-xs font-bold text-black">{new Date(log.timestamp).toLocaleString()}</div>
                                                {log.reason && <div className="text-[10px] text-gray-400 italic">Note: {log.reason}</div>}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${log.type === 'EXIT' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                {log.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No movements recorded yet</p>
                            )}
                        </div>
                    </div>

                    {/* Meal Feedback Trends */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 uppercase tracking-widest text-[10px] font-bold text-gray-500">
                            Recent Meal Feedback
                        </div>
                        <div className="p-6 space-y-4">
                            {studentData.mealReviews.length > 0 ? (
                                <div className="space-y-4">
                                    {studentData.mealReviews.map((review: any) => (
                                        <div key={review.id} className="space-y-1 py-2 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] font-black text-black uppercase tracking-wider">{review.mealType} • {new Date(review.date).toLocaleDateString()}</div>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'text-black fill-black' : 'text-gray-200'}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && <p className="text-xs text-gray-600 italic">"{review.comment}"</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No feedback submitted yet</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Rector Admin Panel */}
            {isRector && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Room Allocation Form */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                        <div className="p-6 bg-black text-white font-black uppercase tracking-[0.2em] text-[10px]">
                            Room Allocation Control
                        </div>
                        <form action={allocateRoom} className="p-8 space-y-6">
                            <input type="hidden" name="studentId" value={studentData.id} />
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Residence</label>
                                <select
                                    name="roomId"
                                    required
                                    className="w-full border-b border-gray-100 bg-transparent py-3 text-sm font-bold focus:border-black outline-none transition-all appearance-none"
                                >
                                    <option value="">Select a vacant room...</option>
                                    {(await db.room.findMany({ include: { occupants: true } }))
                                        .filter(r => r.occupants.length < r.capacity)
                                        .map(room => (
                                            <option key={room.id} value={room.id}>
                                                Room {room.number} ({room.type.replace('_', ' ')}) - {room.capacity - room.occupants.length} slots left
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <button className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-black/10">
                                Confirm Allocation
                            </button>
                        </form>
                    </div>

                    {/* Financial Control */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                        <div className="p-6 bg-black text-white font-black uppercase tracking-[0.2em] text-[10px]">
                            Financial Oversight
                        </div>
                        <form action={setStudentYearlyFee} className="p-8 space-y-6">
                            <input type="hidden" name="studentId" value={studentData.id} />
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Set Academic Year Fee (₹)</label>
                                <input
                                    name="yearlyFee"
                                    type="number"
                                    required
                                    defaultValue={(studentData.profile as any)?.yearlyFee || ''}
                                    placeholder="e.g. 75000"
                                    className="w-full border-b border-gray-100 bg-transparent py-3 text-sm font-bold focus:border-black outline-none transition-all"
                                />
                            </div>
                            <button className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-black/10">
                                Update Financial Record
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
