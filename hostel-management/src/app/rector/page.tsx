import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import HostelNameForm from "@/components/HostelNameForm";

export default async function RectorDashboard() {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") {
        redirect("/login");
    }

    // Fetch summary data
    const students = await db.user.findMany({
        where: { role: "STUDENT" },
        include: {
            entryExitLogs: {
                take: 1,
                orderBy: { timestamp: 'desc' }
            }
        }
    });
    const roomRequests = await (db as any).roomChangeRequest?.findMany({ where: { status: 'PENDING' } }) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviews = await (db as any).mealReview?.findMany({ where: { date: today } }) || [];
    const movementLogs = await (db as any).entryExitLog?.findMany({
        orderBy: { timestamp: 'desc' },
        include: { student: true },
        take: 5
    }) || [];
    const announcements = await (db as any).announcement?.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3
    }) || [];

    const hostelSettings = await (db as any).hostelSettings?.findFirst({
        where: { id: "default" }
    }) || { hostelName: "University Hostel" };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-black">Administrator Console</h1>
                    <p className="text-gray-400 mt-2 font-medium">Real-time oversight of hostel operations</p>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">System Status</div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                        Operational
                    </div>
                </div>
            </div>

            {/* Hostel Settings */}
            <HostelNameForm defaultName={hostelSettings.hostelName} />

            {/* High-Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm group hover:border-black transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Total Students</p>
                    <div className="text-4xl font-black text-black group-hover:scale-105 transition-transform origin-left">{students.length}</div>
                    <Link href="/rector/students" className="mt-6 text-[10px] font-bold text-gray-300 hover:text-black transition-colors flex items-center gap-2 group/link">
                        Manage Residents
                        <svg className="group-hover/link:translate-x-1 transition-transform" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                    </Link>
                </div>

                <div className="p-8 bg-black text-white rounded-3xl shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Pending Requests</p>
                    <div className="text-4xl font-black">{roomRequests.length}</div>
                    <Link href="/rector/room-requests" className="mt-6 text-[10px] font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2 group/link">
                        Review Submissions
                        <svg className="group-hover/link:translate-x-1 transition-transform" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                    </Link>
                </div>

                <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Meal Reviews (Today)</p>
                    <div className="text-4xl font-black text-black">{reviews.length}</div>
                    <Link href="/rector/meals" className="mt-6 text-[10px] font-bold text-gray-300 hover:text-black transition-colors flex items-center gap-2 group/link">
                        View Analytics
                        <svg className="group-hover/link:translate-x-1 transition-transform" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                    </Link>
                </div>

                <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Out of Hostel</p>
                    <div className="text-4xl font-black text-black">{students.filter(s => s.entryExitLogs?.[0]?.type === 'EXIT').length}</div>
                    <Link href="/rector/movement" className="mt-6 text-[10px] font-bold text-gray-300 hover:text-black transition-colors flex items-center gap-2 group/link">
                        Track Movements
                        <svg className="group-hover/link:translate-x-1 transition-transform" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                    </Link>
                </div>
            </div>

            {/* Main Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Table (Brief) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-black">Recent Activity</h2>
                        <Link href="/rector/movement" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black">View All</Link>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {movementLogs.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-gray-50/20 transition-colors">
                                            <td className="px-6 py-4 font-bold text-black">{log.student.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${log.type === 'ENTRY' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {log.type === 'ENTRY' ? 'Entered' : 'Exited'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 font-medium">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Announcements Brief */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-black">Announcements</h2>
                        <Link href="/rector/announcements" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black">Post New</Link>
                    </div>
                    <div className="space-y-4">
                        {announcements.map((ann: any) => (
                            <div key={ann.id} className="p-5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                                <h3 className="font-bold text-xs text-black">{ann.title}</h3>
                                <p className="mt-1 text-xs text-gray-500 line-clamp-1">{ann.content}</p>
                            </div>
                        ))}
                        {announcements.length === 0 && (
                            <div className="p-10 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                                <p className="text-xs text-gray-400 italic">No announcements</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
