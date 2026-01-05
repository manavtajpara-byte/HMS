import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StudentDirectory({
    searchParams,
}: {
    searchParams: { query?: string };
}) {
    const session = await auth();
    if (session?.user?.role !== "STUDENT" && session?.user?.role !== "RECTOR") {
        redirect("/login");
    }

    const isRector = session?.user?.role === "RECTOR";

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
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Student Directory</h1>
                    <p className="text-gray-500 mt-1">Connect with other residents</p>
                </div>
                <Link
                    href={isRector ? "/rector" : "/student"}
                    className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 rounded-md text-sm font-medium transition-colors"
                >
                    Back to Dashboard
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <form action="/student/directory" method="GET">
                    <input
                        name="query"
                        type="text"
                        placeholder="Search by name, email or room..."
                        defaultValue={query}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                    />
                </form>
            </div>

            {/* Student Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allStudents.map((student) => (
                    <Link
                        key={student.id}
                        href={`/student/profile/${student.id}`}
                        className="bg-white rounded-lg border border-gray-200 hover:border-black transition-all overflow-hidden group"
                    >
                        <div className="bg-black p-6 text-white text-center relative">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden border-2 border-white/20">
                                {student.image ? (
                                    <img
                                        src={student.image}
                                        alt={student.name || 'Student'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="text-lg font-bold truncate max-w-[200px] mx-auto">{student.name}</h3>
                            {student.id === session.user.id && (
                                <span className="absolute top-2 right-2 px-2 py-0.5 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-full">YOU</span>
                            )}
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    <span className="text-gray-600 truncate">{student.email}</span>
                                </div>
                                {student.profile?.degree && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                                        </svg>
                                        <span className="text-gray-600">{student.profile.degree}</span>
                                    </div>
                                )}
                                {student.profile?.room && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        </svg>
                                        <span className="text-gray-600 font-medium">Room {student.profile.room.number}</span>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                                    View Profile
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-black transition-colors">
                                    <path d="M5 12h14"></path>
                                    <path d="m12 5 7 7-7 7"></path>
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {allStudents.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-lg">
                    <p className="text-gray-400 italic">No students found</p>
                </div>
            )}
        </div>
    );
}
