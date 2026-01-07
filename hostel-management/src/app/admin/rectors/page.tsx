import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UserPlus, UserCircle, Key, ShieldCheck } from "lucide-react";
import RectorCreationForm from "@/components/RectorCreationForm";

export default async function AdminRectorsPage() {
    const session = await auth();

    const rectors = await db.user.findMany({
        where: { role: "RECTOR" },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-black">Rector Management</h1>
                <p className="text-gray-400 mt-2 font-medium">Provision new administrative access and manage staff credentials</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* Creation Form */}
                <div className="xl:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center">
                                <UserPlus size={20} />
                            </div>
                            <h2 className="text-xl font-black text-black">New Rector</h2>
                        </div>
                        <RectorCreationForm />
                    </div>
                </div>

                {/* Rectors List */}
                <div className="xl:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-black">Active Rectors</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {rectors.map((rector) => (
                            <div key={rector.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 group hover:border-black transition-all duration-500">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                        <UserCircle size={24} />
                                    </div>
                                    <ShieldCheck size={16} className="text-green-500" />
                                </div>
                                <h3 className="text-xl font-black text-black mb-1">{rector.name}</h3>
                                <p className="text-xs font-mono text-gray-400 mb-6 uppercase tracking-widest">{rector.email}</p>

                                <div className="pt-6 border-t border-gray-50 flex items-center gap-3">
                                    <Key size={14} className="text-gray-300" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Credentials Active</span>
                                </div>
                            </div>
                        ))}
                        {rectors.length === 0 && (
                            <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                                <p className="text-gray-400 font-medium italic">No rectors registered in the system yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
