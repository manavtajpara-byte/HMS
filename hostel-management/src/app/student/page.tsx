import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StudentDashboard() {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") {
        redirect("/login");
    }

    const studentData = await db.user.findUnique({
        where: { id: session.user.id },
        include: { profile: { include: { room: true } } }
    });

    const announcements = await (db as any).announcement?.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3
    }) || [];

    const latestLog = await (db as any).entryExitLog?.findFirst({
        where: { studentId: session.user.id },
        orderBy: { timestamp: 'desc' },
        select: { type: true, timestamp: true }
    }) || null;

    // Fetch vacant rooms
    const allRooms = await db.room.findMany({
        include: { occupants: true },
        orderBy: { number: 'asc' }
    });
    const vacantRooms = allRooms.filter(r => r.occupants.length < r.capacity);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Fetch today's reviews to update UI state
    const existingReviews = await (db as any).mealReview?.findMany({
        where: {
            studentId: session.user.id,
            date: today
        },
        select: { mealType: true }
    }) || [];

    const notifications = await (db as any).notification?.findMany({
        where: {
            userId: session.user.id,
            read: false
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    }) || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Welcome Back, {studentData?.name}</h1>
                    <p className="text-gray-500 mt-1">Hostel Management System Overview</p>
                </div>
            </div>

            {/* Notifications Section */}
            {notifications.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                        <span className="w-4 h-0.5 bg-black"></span>
                        Recent Notifications
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {notifications.map((notif: any) => (
                            <div key={notif.id} className={`p-4 rounded-2xl border flex gap-4 ${notif.type === 'SUCCESS' ? 'bg-green-50 border-green-100' :
                                notif.type === 'ERROR' ? 'bg-red-50 border-red-100' :
                                    'bg-gray-50 border-gray-100'
                                }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                    notif.type === 'ERROR' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {notif.type === 'SUCCESS' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                    ) : notif.type === 'ERROR' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-black">{notif.title}</h3>
                                    <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-1">
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/student/meals" className="group p-6 border border-gray-200 rounded-2xl bg-white hover:border-black transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M18 6H6" /><path d="M6 12h12" /><path d="M18 18H6" /></svg>
                    </div>
                    <h3 className="font-bold text-black group-hover:translate-x-1 transition-transform">Meal Reviews</h3>
                    <p className="text-sm text-gray-500 mt-1">Submit feedback for today's meals</p>
                </Link>

                <Link href="/student/movement" className="group p-6 border border-gray-200 rounded-2xl bg-white hover:border-black transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" /><polyline points="13 2 13 9 20 9" /></svg>
                    </div>
                    <h3 className="font-bold text-black group-hover:translate-x-1 transition-transform">Movement Logs</h3>
                    <p className="text-sm text-gray-500 mt-1">Log your entry and exit history</p>
                </Link>

                <Link href="/student/rooms" className="group p-6 border border-gray-200 rounded-2xl bg-white hover:border-black transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" /><path d="m3 9 2.45-4.91A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.79 1.09L21 9" /></svg>
                    </div>
                    <h3 className="font-bold text-black group-hover:translate-x-1 transition-transform">Room Assignment</h3>
                    <p className="text-sm text-gray-500 mt-1">Check vacancy and request change</p>
                </Link>
            </div>

            {/* Status Overview & Announcements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Announcements Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-black flex items-center gap-2">
                            <span className="w-2 h-2 bg-black rounded-full" />
                            Recent Announcements
                        </h2>
                    </div>
                    {announcements.length > 0 ? (
                        <div className="space-y-4">
                            {announcements.map((announcement: any) => (
                                <div key={announcement.id} className="p-5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                                    <h3 className="font-bold text-black">{announcement.title}</h3>
                                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                                    <p className="mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                            <p className="text-gray-400 italic">No new announcements</p>
                        </div>
                    )}
                </div>

                {/* Status Dashboard */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-black">Current Status</h2>

                    <div className="space-y-4">
                        {/* Entry/Exit Status Widget */}
                        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Hostel Presence</span>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${latestLog?.type === 'EXIT' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {latestLog?.type === 'EXIT' ? 'AWAY' : 'PRESENT'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Last recorded activity: <span className="font-bold text-black">{latestLog ? new Date(latestLog.timestamp).toLocaleString() : 'No record'}</span></p>
                        </div>

                        {/* Room Info Widget */}
                        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Accomodation</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-black underline underline-offset-4">Verified</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-black">{studentData?.profile?.room ? `Room ${studentData.profile.room.number}` : "Not Assigned"}</p>
                                <p className="text-xs text-gray-400 font-bold uppercase">{studentData?.profile?.room?.type.replace('_', ' ')}</p>
                            </div>
                        </div>

                        {/* Fee Status Widget */}
                        <div className="p-6 bg-black text-white rounded-2xl shadow-xl">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Financials</span>
                                <span className="px-2 py-0.5 border border-white/20 rounded text-[10px] font-bold uppercase tracking-widest">Paid</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Total Fee Paid</p>
                                    <p className="text-xl font-bold">₹{(studentData?.profile as any)?.yearlyFee?.toLocaleString() || '0'}</p>
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase">Academic Year 2023-24</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
