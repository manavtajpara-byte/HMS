import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import EntryExitSection from "@/components/EntryExitSection";

export default async function StudentMovementPage() {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") {
        redirect("/login");
    }

    const latestLog = await (db as any).entryExitLog?.findFirst({
        where: { studentId: session.user.id },
        orderBy: { timestamp: 'desc' },
        select: { type: true, timestamp: true }
    }) || null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Movement Tracking</h1>
                    <p className="text-gray-500 mt-1">Log your entry and exit from the hostel</p>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                <EntryExitSection latestLog={latestLog} />
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Pro-Tip</h3>
                <p className="text-sm text-gray-600">Always remember to log your exit when leaving for more than 2 hours. This helps the administration in case of emergencies.</p>
            </div>
        </div>
    );
}
