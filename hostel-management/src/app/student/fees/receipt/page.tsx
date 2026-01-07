import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import FeeReceipt from "@/components/FeeReceipt";

export default async function ReceiptPage() {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") {
        redirect("/login");
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true }
    });

    const hostelSettings = await (db as any).hostelSettings?.findFirst({
        where: { id: "default" }
    }) || { hostelName: "University Hostel" };

    const yearlyFee = (user?.profile as any)?.yearlyFee || 0;

    // Generate a pseudo-random receipt number for demo
    const receiptNumber = `HMS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <FeeReceipt
            studentName={user?.name || "Student"}
            studentEmail={user?.email || ""}
            hostelName={hostelSettings.hostelName}
            amount={yearlyFee}
            receiptNumber={receiptNumber}
            date={date}
            academicYear="2025-26"
        />
    );
}
