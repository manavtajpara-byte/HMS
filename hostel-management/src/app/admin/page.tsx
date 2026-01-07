import { auth } from "@/auth";
import { ShieldCheck, Users, Settings } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
    const session = await auth();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-black">Control Center</h1>
                    <p className="text-gray-400 mt-2 font-medium tracking-tight text-lg">System-wide administration and management</p>
                </div>
                <div className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10">
                    <ShieldCheck size={20} className="text-white/40" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Verified Administrator</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Link href="/admin/rectors" className="group p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:border-black transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[4rem] flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white">
                        <Users size={24} />
                    </div>
                    <div className="pt-4">
                        <h3 className="text-2xl font-black text-black mb-2">Rector Hub</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Create and manage rector profiles with auto-generated system credentials.</p>
                    </div>
                </Link>

                <Link href="/admin/settings" className="group p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:border-black transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[4rem] flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white">
                        <Settings size={24} />
                    </div>
                    <div className="pt-4">
                        <h3 className="text-2xl font-black text-black mb-2">Global Settings</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Configure system-wide parameters, security protocols, and integration keys.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
