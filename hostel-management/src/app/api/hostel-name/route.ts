import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (session?.user?.role !== "RECTOR") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { hostelName } = await request.json();

        if (!hostelName || hostelName.trim().length === 0) {
            return NextResponse.json({ error: "Hostel name is required" }, { status: 400 });
        }

        await (db as any).hostelSettings?.upsert({
            where: { id: "default" },
            update: {
                hostelName: hostelName.trim(),
                updatedBy: session.user.id,
            },
            create: {
                id: "default",
                hostelName: hostelName.trim(),
                updatedBy: session.user.id,
            },
        });

        revalidatePath("/");
        revalidatePath("/login");
        revalidatePath("/rector");

        return NextResponse.json({ success: true, hostelName: hostelName.trim() });
    } catch (error: any) {
        console.error("Error updating hostel name:", error);
        return NextResponse.json({ error: error.message || "Failed to update hostel name" }, { status: 500 });
    }
}
