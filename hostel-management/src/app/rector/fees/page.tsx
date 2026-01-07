import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { setStudentYearlyFee } from "../../actions";
import { Search, Banknote, Users, TrendingUp } from "lucide-react";

export default async function RectorFeesPage({
    searchParams,
}: {
    searchParams: { query?: string };
}) {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") {
        redirect("/login");
    }

    const query = searchParams.query || "";

    const students = await db.user.findMany({
        where: {
            role: "STUDENT",
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
            ]
        },
        include: { profile: true },
        orderBy: { name: 'asc' }
    });

    const totalExpected = students.reduce((acc, curr) => acc + ((curr.profile as any)?.yearlyFee || 0), 0);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-100 pb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-black">Financial Management</h1>
                    <p className="text-gray-400 mt-2 font-medium">Revenue oversight and student fee configuration</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <div className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Projected Revenue</p>
                        <p className="text-xl font-black text-black">₹{totalExpected.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Residents</p>
                        <p className="text-xl font-black text-black">{students.length}</p>
                    </div>
                </div>
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-50 text-black border border-gray-100 rounded-xl flex items-center justify-center">
                        <Banknote size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Average Fee</p>
                        <p className="text-xl font-black text-black">₹{(totalExpected / (students.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-50 text-black border border-gray-100 rounded-xl flex items-center justify-center">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Yearly Targets</p>
                        <p className="text-xl font-black text-green-600">On Track</p>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-black tracking-tight">Student Fee Registry</h2>

                    <div className="relative max-w-xs">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <form action="/rector/fees" method="GET">
                            <input
                                name="query"
                                defaultValue={query}
                                placeholder="Search students..."
                                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                            />
                        </form>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-50">
                            <tr>
                                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Student Identity</th>
                                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Current Yearly Fee</th>
                                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Update Allocation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/20 transition-all group">
                                    <td className="px-10 py-6">
                                        <div className="font-bold text-black">{student.name}</div>
                                        <div className="text-[10px] text-gray-400 font-mono tracking-tighter">{student.email}</div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="inline-flex items-baseline gap-1 bg-gray-50 px-4 py-2 rounded-xl group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                                            <span className="text-gray-400 font-bold text-xs">₹</span>
                                            <span className="text-lg font-black text-black">{(student.profile as any)?.yearlyFee?.toLocaleString() || '0'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <form action={setStudentYearlyFee} className="flex items-center justify-end gap-3">
                                            <input type="hidden" name="studentId" value={student.id} />
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">₹</span>
                                                <input
                                                    type="number"
                                                    name="yearlyFee"
                                                    placeholder="Set New Fee"
                                                    className="w-32 pl-8 pr-4 py-2.5 text-xs font-bold bg-gray-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-black transition-all"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                                            >
                                                Apply
                                            </button>
                                        </form>
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
