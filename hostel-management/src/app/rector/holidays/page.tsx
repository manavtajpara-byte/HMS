import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Check, X, User as UserIcon, Calendar } from "lucide-react";
import HolidayActionButtons from "@/components/HolidayActionButtons";

export default async function RectorHolidaysPage() {
    const session = await auth();
    const pendingHolidays = await (db as any).messHoliday.findMany({
        where: { status: 'PENDING' },
        include: { student: true },
        orderBy: { createdAt: 'desc' }
    }) || [];

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-black uppercase">Holiday Approvals</h1>
                <p className="text-gray-400 mt-2 font-medium">Manage student meal opt-out requests</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {pendingHolidays.map((h: any) => (
                    <div key={h.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 space-y-8 hover:border-black transition-all shadow-sm group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                <UserIcon size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-black">{h.student.name}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{h.student.email}</p>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50/50 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>Period</span>
                                <span className="text-black">{Math.ceil((new Date(h.endDate).getTime() - new Date(h.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days</span>
                            </div>
                            <div className="flex items-center gap-3 font-bold text-sm text-black">
                                <Calendar size={16} className="text-gray-300" />
                                <span>{new Date(h.startDate).toLocaleDateString()}</span>
                                <span className="text-gray-300">→</span>
                                <span>{new Date(h.endDate).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <HolidayActionButtons holidayId={h.id} />
                    </div>
                ))}

                {pendingHolidays.length === 0 && (
                    <div className="col-span-full py-32 border-2 border-dashed border-gray-100 rounded-[3rem] text-center">
                        <p className="text-gray-400 font-black uppercase tracking-widest">No pending requests</p>
                    </div>
                )}
            </div>
        </div>
    );
}
