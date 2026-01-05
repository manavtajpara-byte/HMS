import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function RectorMovementPage() {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") {
        redirect("/login");
    }

    const movementLogs = await (db as any).entryExitLog?.findMany({
        orderBy: { timestamp: 'desc' },
        include: { student: true },
        take: 50
    }) || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Movement History</h1>
                    <p className="text-gray-500 mt-1">Real-time tracking of student entries and exits</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-8 py-5">Student</th>
                                <th className="px-8 py-5">Activity</th>
                                <th className="px-8 py-5">Timestamp</th>
                                <th className="px-8 py-5">Note/Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {movementLogs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-black">{log.student?.name}</div>
                                        <div className="text-[10px] text-gray-400 uppercase">{log.student?.email}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${log.type === 'ENTRY'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-red-50 text-red-700'
                                            }`}>
                                            {log.type === 'ENTRY' ? 'Entry' : 'Exit'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-gray-600">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-xs text-gray-500 italic">
                                            {log.reason || 'Routine movement'}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
