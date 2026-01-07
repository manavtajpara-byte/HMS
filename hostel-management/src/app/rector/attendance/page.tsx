import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import FaceAttendance from "@/components/FaceAttendance";
import { Scan, Users, LogIn, LogOut, TrendingUp } from "lucide-react";

export default async function RectorAttendancePage() {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") {
        redirect("/login");
    }

    const students = await db.user.findMany({
        where: { role: "STUDENT" },
        select: {
            id: true,
            name: true,
            profile: {
                select: {
                    faceDescriptor: true
                }
            }
        }
    });

    const logs = await (db as any).entryExitLog?.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: { student: true }
    }) || [];

    const inHostelCount = await (db as any).entryExitLog?.groupBy({
        by: ['studentId'],
        _max: { timestamp: true },
    }).then(async (latestLogs: any[]) => {
        let count = 0;
        for (const log of latestLogs) {
            const entry = await (db as any).entryExitLog.findFirst({
                where: {
                    studentId: log.studentId,
                    timestamp: log._max.timestamp
                }
            });
            if (entry?.type === 'ENTRY') count++;
        }
        return count;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-100 pb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-black">A.I. Attendance</h1>
                    <p className="text-gray-400 mt-2 font-medium">Biometric synchronization for resident tracking</p>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Live Engine</div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Face Scanner Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Scanner Interface */}
                <div className="lg:col-span-2 space-y-8">
                    <FaceAttendance students={students as any} />

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                        <h2 className="text-xl font-black text-black mb-6 flex items-center gap-3">
                            <TrendingUp size={20} />
                            Traffic Analytics
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Morning Inflow (Avg)</p>
                                <p className="text-2xl font-black text-black">12.4 <span className="text-xs text-green-600">↑+12%</span></p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Evening Outflow (Avg)</p>
                                <p className="text-2xl font-black text-black">8.1 <span className="text-xs text-red-600">↓-3%</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Feed */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                        <h3 className="text-lg font-black text-black mb-6">Current Occupancy</h3>
                        <div className="flex items-center justify-between p-6 bg-black text-white rounded-2xl mb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">In Hostel</p>
                            <p className="text-4xl font-black">{inHostelCount || 0}</p>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-gray-100 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Capacity</p>
                            <p className="text-2xl font-black text-black">120</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-black text-black">System Logs</h3>
                        <div className="space-y-3">
                            {logs.map((log: any) => (
                                <div key={log.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-black transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${log.type === 'ENTRY' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {log.type === 'ENTRY' ? <LogIn size={14} /> : <LogOut size={14} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-black">{log.student.name}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <Scan size={12} className="text-gray-200 group-hover:text-black transition-colors" />
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <p className="text-center text-xs text-gray-400 italic py-10">No logs found today</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
