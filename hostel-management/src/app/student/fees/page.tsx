import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import PaymentQRCode from "@/components/PaymentQRCode";
import { Banknote, ShieldCheck, Clock, Receipt } from "lucide-react";

export default async function StudentFeesPage() {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") {
        redirect("/login");
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true }
    });

    const hostelSettings = await (db as any).hostelSettings?.findFirst({
        where: { id: "default" }
    }) || { hostelName: "University Hostel" };

    const yearlyFee = (user?.profile as any)?.yearlyFee || 0;
    const upiId = hostelSettings.upiId;
    const merchantName = hostelSettings.merchantName;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-black">Financial Overview</h1>
                    <p className="text-gray-400 mt-2 font-medium">Manage your hostel dues and payment history</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                    <ShieldCheck size={16} className="text-green-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secure Billing System</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Fee Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-black text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-white/10" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                    <Banknote size={16} className="text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Total Outstanding</span>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div>
                                    <div className="text-6xl font-black tracking-tighter mb-2">₹{yearlyFee.toLocaleString()}</div>
                                    <div className="flex items-center gap-3 text-green-400 font-bold text-xs uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        Academic Year 2025-26
                                    </div>
                                </div>

                                {upiId && merchantName && yearlyFee > 0 && (
                                    <div className="flex-shrink-0">
                                        <PaymentQRCode
                                            amount={yearlyFee}
                                            upiId={upiId}
                                            merchantName={merchantName}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Important Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white border border-gray-100 rounded-3xl group hover:border-black transition-all duration-500">
                            <Clock className="text-gray-300 mb-4 group-hover:text-black transition-colors" size={24} />
                            <h3 className="font-black text-xs uppercase tracking-widest text-black mb-2">Payment Deadline</h3>
                            <p className="text-sm text-gray-500 font-medium">Monthly dues are collected before the 5th of every month. Please ensure timely settlements.</p>
                        </div>
                        <a
                            href="/student/fees/receipt"
                            target="_blank"
                            className="p-8 bg-white border border-gray-100 rounded-3xl group hover:border-black hover:shadow-xl transition-all duration-500 block text-left"
                        >
                            <Receipt className="text-gray-300 mb-4 group-hover:text-black transition-colors" size={24} />
                            <h3 className="font-black text-xs uppercase tracking-widest text-black mb-2 group-hover:underline underline-offset-4">Generate Tax Invoice</h3>
                            <p className="text-sm text-gray-500 font-medium">Click here to generate a professional PDF-ready fee receipt for your records.</p>
                        </a>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-black">Banking Reference</h2>
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 space-y-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Merchant</p>
                            <p className="text-sm font-bold text-black">{merchantName || 'Not Configured'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">UPI Handle</p>
                            <p className="text-xs font-mono text-gray-500">{upiId || 'Not Configured'}</p>
                        </div>
                        <div className="pt-6 border-t border-gray-200">
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-[9px] text-amber-800 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                                    Notice
                                </p>
                                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                    For cash payments or scholarship adjustments, please visit the Rector's office during office hours.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
