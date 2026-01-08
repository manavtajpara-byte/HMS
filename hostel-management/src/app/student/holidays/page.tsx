import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { applyMessHoliday } from "@/app/actions";

export default async function StudentHolidaysPage() {
    const session = await auth();
    const holidays = await (db as any).messHoliday.findMany({
        where: { studentId: session?.user?.id },
        orderBy: { createdAt: 'desc' }
    }) || [];

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-black uppercase">Mess Holiday</h1>
                <p className="text-gray-400 mt-2 font-medium">Apply for temporary meal opt-out during vacations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Form */}
                <div className="md:col-span-1">
                    <form action={applyMessHoliday} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 sticky top-24">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 px-1">Start Date</label>
                                <input
                                    required
                                    name="startDate"
                                    type="date"
                                    className="w-full h-14 px-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all outline-none font-bold text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 px-1">End Date</label>
                                <input
                                    required
                                    name="endDate"
                                    type="date"
                                    className="w-full h-14 px-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all outline-none font-bold text-sm"
                                />
                            </div>
                        </div>
                        <button className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                            Submit Request
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-black">Request History</h2>
                    <div className="space-y-4">
                        {holidays.map((h: any) => (
                            <div key={h.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-between group hover:border-black transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-black">{new Date(h.startDate).toLocaleDateString()}</span>
                                            <span className="text-gray-300">→</span>
                                            <span className="font-bold text-black">{new Date(h.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                                            {Math.ceil((new Date(h.endDate).getTime() - new Date(h.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days
                                        </p>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${h.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                                        h.status === 'REJECTED' ? 'bg-red-50 text-red-600' :
                                            'bg-orange-50 text-orange-600'
                                    }`}>
                                    {h.status === 'APPROVED' ? <CheckCircle2 size={14} /> :
                                        h.status === 'REJECTED' ? <XCircle size={14} /> :
                                            <Clock size={14} />}
                                    {h.status}
                                </div>
                            </div>
                        ))}
                        {holidays.length === 0 && (
                            <div className="p-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-center">
                                <p className="text-gray-400 font-medium italic">No holiday requests found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
