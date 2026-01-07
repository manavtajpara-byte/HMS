import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    try {
        const session = await auth();
        // Allow RECTOR to mark or maybe STUDENT scanning themselves (but usually Rector's machine)
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { studentId, type: forcedType } = await request.json();

        if (!studentId) {
            return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
        }

        // Determine logical type: Toggle based on last log
        const lastLog = await (db as any).entryExitLog?.findFirst({
            where: { studentId },
            orderBy: { timestamp: 'desc' }
        });

        const type = forcedType || (lastLog?.type === 'ENTRY' ? 'EXIT' : 'ENTRY');

        const log = await (db as any).entryExitLog?.create({
            data: {
                studentId,
                type,
                reason: "A.I. Biometric Scan"
            },
            include: { student: true }
        });

        revalidatePath("/rector");
        revalidatePath("/rector/attendance");
        revalidatePath("/rector/movement");
        revalidatePath("/student");

        return NextResponse.json({
            success: true,
            type,
            studentName: log.student.name
        });
    } catch (error: any) {
        console.error("Attendance log error:", error);
        return NextResponse.json({ error: "Failed to log attendance" }, { status: 500 });
    }
}
