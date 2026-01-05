"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HostelNameForm({ defaultName }: { defaultName: string }) {
    const router = useRouter();
    const [currentName, setCurrentName] = useState(defaultName);
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
                body: JSON.stringify({ hostelName: currentName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update hostel name');
            }

            setMessage({ type: 'success', text: 'Hostel name updated successfully!' });
            router.refresh();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update hostel name' });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-black to-gray-800 rounded-3xl p-8 shadow-2xl text-white">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Hostel Configuration</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-sm font-bold text-gray-300 mb-2 block">Hostel Name</label>
                    <input
                        name="hostelName"
                        value={currentName}
                        onChange={(e) => setCurrentName(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:bg-white/20 focus:border-white/40 outline-none transition-all"
                        placeholder="Enter hostel name"
                        required
                    />
                </div>

                {message && (
                    <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                        <p className="text-sm font-bold">{message.text}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isPending ? (
                        <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                        </>
                    ) : (
                        'Update Hostel Name'
                    )}
                </button>
            </form>
        </div>
    );
}
