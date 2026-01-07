"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HostelNameForm({
    defaultName,
    defaultUpiId,
    defaultMerchantName
}: {
    defaultName: string,
    defaultUpiId?: string | null,
    defaultMerchantName?: string | null
}) {
    const router = useRouter();
    const [currentName, setCurrentName] = useState(defaultName);
    const [upiId, setUpiId] = useState(defaultUpiId || "");
    const [merchantName, setMerchantName] = useState(defaultMerchantName || "");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        setIsPending(true);

        try {
            const response = await fetch('/api/hostel-name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hostelName: currentName,
                    upiId: upiId,
                    merchantName: merchantName
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update hostel settings');
            }

            setMessage({ type: 'success', text: 'Hostel settings updated successfully!' });
            router.refresh();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update hostel settings' });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-black to-gray-800 rounded-[2.5rem] p-10 shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32 group-hover:bg-white/10 transition-all duration-700" />

            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-10 selection:bg-white selection:text-black">Configuration Hub</h2>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Hostel Identifier</label>
                        <input
                            name="hostelName"
                            value={currentName}
                            onChange={(e) => setCurrentName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:bg-white/10 focus:border-white/30 outline-none transition-all duration-500 font-bold"
                            placeholder="Primary Name"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Merchant UPI ID</label>
                        <input
                            name="upiId"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:bg-white/10 focus:border-white/30 outline-none transition-all duration-500 font-mono text-sm"
                            placeholder="e.g., hostel@okaxis"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Verified Name</label>
                        <input
                            name="merchantName"
                            value={merchantName}
                            onChange={(e) => setMerchantName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:bg-white/10 focus:border-white/30 outline-none transition-all duration-500 font-bold"
                            placeholder="Merchant Name"
                        />
                    </div>
                </div>

                {message && (
                    <div className={`p-5 rounded-2xl border animate-in slide-in-from-top-2 duration-500 ${message.type === 'success' ? 'bg-white/5 border-white/20 text-white' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                        <p className="text-xs font-bold flex items-center gap-3">
                            {message.type === 'success' && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                            {message.text}
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="h-14 px-10 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group"
                >
                    {isPending ? (
                        <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            Syncing Data...
                        </>
                    ) : (
                        <>
                            Apply Changes
                            <div className="w-1.5 h-1.5 bg-black rounded-full group-hover:bg-black/50 transition-colors" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
