import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { deleteUser } from "../../actions";

export default async function RectorStudentsPage({
    searchParams,
}: {
    searchParams: { query?: string };
}) {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") {
        redirect("/login");
    }

    const query = searchParams.query || "";

    const allStudents = await db.user.findMany({
        where: {
            role: "STUDENT",
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
                { profile: { roomNumber: { contains: query } } }
            ]
        },
        include: { profile: { include: { room: true } } },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Student Management</h1>
                    <p className="text-gray-500 mt-1">Review profiles and manage room assignments</p>
                </div>
                <Link
                    href="/student/directory"
                    className="px-6 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                    View All Profiles
                </Link>
            </div>


            {/* Search Bar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <form action="/rector/students" method="GET">
                        <input
                            name="query"
                            type="text"
                            placeholder="Search by name, email or room..."
                            defaultValue={query}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black transition-all"
                        />
                    </form>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-8 py-5">Profile</th>
                                <th className="px-8 py-5">Contact</th>
                                <th className="px-8 py-5">Assignment</th>
                                <th className="px-8 py-5">Financials</th>
                                <th className="px-8 py-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {allStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black text-xs">
                                                {student.image ? <img src={student.image} className="w-full h-full rounded-full object-cover" /> : student.name?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-black">{student.name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-black">{student.profile?.degree || 'No Degree'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-gray-600 font-medium">{student.email}</div>
                                        <div className="text-xs text-gray-400">{student.profile?.contactNumber || 'No contact'}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {student.profile?.room ? (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase">
                                                <span className="w-1 h-1 bg-green-600 rounded-full" />
                                                Room {student.profile.room.number}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-black">₹{(student.profile as any)?.yearlyFee?.toLocaleString() || '0'}</div>
                                        <div className="text-[10px] text-green-600 font-bold uppercase">Fully Paid</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/student/profile/${student.id}`}
                                                className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all inline-block border border-transparent hover:border-gray-100"
                                                title="View Profile"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                                            </Link>
                                            <form action={deleteUser} className="inline">
                                                <input type="hidden" name="userId" value={student.id} />
                                                <button
                                                    type="submit"
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all inline-block border border-transparent"
                                                    title="Delete User"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 9 2 2 4-4" /></svg>
                                                </button>
                                            </form>
                                        </div>
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
