import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { studentId, descriptor } = await request.json();

        if (!studentId || !descriptor) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // Only allow student to register their own face, or Rector
        if (session.user.role !== "RECTOR" && session.user.id !== studentId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await (db as any).profile.update({
            where: { userId: studentId },
            data: { faceDescriptor: descriptor }
        });

        revalidatePath(`/student/profile/${studentId}`);
        revalidatePath("/rector/attendance");

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Face registration error:", error);
        return NextResponse.json({ error: "Failed to save biometric data" }, { status: 500 });
    }
}
