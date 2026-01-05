import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import { db } from "@/lib/db";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const user = await db.user.findUnique({
        where: { id: session?.user?.id },
        select: { name: true, email: true, image: true }
    });

    const hostelSettings = await (db as any).hostelSettings?.findFirst({
        where: { id: "default" }
    }) || { hostelName: "University Hostel" };

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar role="STUDENT" user={user} />
            <div className="flex-1 flex flex-col min-h-screen ml-64">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-end px-8 border-b border-gray-100 bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-1">Authenticated Campus</p>
                            <h2 className="text-xs font-bold text-black tracking-tight">{hostelSettings.hostelName}</h2>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                    </div>
                </header>
                <main className="p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
