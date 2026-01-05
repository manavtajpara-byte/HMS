import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function InspectorDashboard() {
    const session = await auth();
    if (session?.user?.role !== "INSPECTOR") {
        redirect("/login");
    }

    const totalStudents = await db.user.count({ where: { role: "STUDENT" } });
    const studentsWithRooms = await db.profile.count({
        where: { roomNumber: { not: null } }
    });

    const rooms = await db.room.findMany({
        include: { occupants: { include: { user: true } } }
    });

    const occupancyRate = totalStudents > 0 ? Math.round((studentsWithRooms / 100) * 100) : 0;

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-gray-200 pb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Inspector Audit Hub</h1>
                    <p className="mt-2 text-lg text-slate-600">Authorized Personnel: <span className="font-semibold text-purple-600">{session.user.name}</span></p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-12">
                <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 border-b-4 border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Student Population</h3>
                    <p className="text-4xl font-black text-slate-900">{totalStudents}</p>
                </div>
                <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 border-b-4 border-purple-500">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Allocated Residents</h3>
                    <p className="text-4xl font-black text-purple-600">{studentsWithRooms}</p>
                </div>
                <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 border-b-4 border-emerald-500">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Occupancy Level</h3>
                    <p className="text-4xl font-black text-emerald-600">{occupancyRate}%</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
                    <div className="border-b border-slate-100 bg-slate-50 px-8 py-6">
                        <h2 className="text-xl font-bold text-slate-900">Room Inspection List</h2>
                    </div>
                    <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 sticky top-0">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Room</th>
                                    <th className="px-6 py-4 font-bold">Occupants</th>
                                    <th className="px-6 py-4 font-bold">Capacity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rooms.map((room) => (
                                    <tr key={room.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-bold text-slate-900">{room.number}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-600">
                                                {room.occupants.map(o => o.user.name).join(', ') || <span className="text-slate-300 italic">No occupants</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${room.occupants.length >= room.capacity ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {room.occupants.length} / {room.capacity}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl -mr-16 -mt-16"></div>
                        <h2 className="text-xl font-bold mb-4">Internal Audit Log</h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Status Report</p>
                                <p className="text-sm text-slate-200">Hostel maintenance audit completed. All systems operational.</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Access Token</p>
                                <p className="text-sm font-mono text-purple-400">AUTH-{session.user.id.slice(0, 6).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
