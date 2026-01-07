'use client';

import React, { useState } from 'react';
import { createRector } from '@/app/actions';
import { Loader2, CheckCircle2, Copy, AlertCircle } from 'lucide-react';

export default function RectorCreationForm() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('name', name);

        try {
            const res = await createRector(formData);
            if (res.success) {
                setResult(res);
                setName('');
            } else {
                setError(res.error || 'Something went wrong');
            }
        } catch (err) {
            setError('System error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-6">
            {!result ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Rector Full Name</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Dr. John Doe"
                            className="w-full h-14 px-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all outline-none font-medium"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-xl"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Provision Account'}
                    </button>
                </form>
            ) : (
                <div className="animate-in zoom-in duration-500 space-y-6 text-left">
                    <div className="p-6 bg-green-50 rounded-3xl border border-green-100 flex flex-col items-center text-center">
                        <CheckCircle2 size={40} className="text-green-500 mb-4" />
                        <h4 className="text-lg font-black text-black mb-1">Account Provisioned</h4>
                        <p className="text-xs text-gray-500 font-medium">Credential generation successful</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">System ID / Email</p>
                            <p className="font-mono text-xs font-bold text-black">{result.rectorId}</p>
                            <button onClick={() => copyToClipboard(result.rectorId)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Temporary Password</p>
                            <p className="font-mono text-xs font-bold text-black">{result.password}</p>
                            <button onClick={() => copyToClipboard(result.password)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setResult(null)}
                        className="w-full h-14 bg-gray-100 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all shadow-sm"
                    >
                        Create Another
                    </button>

                    <p className="text-[9px] text-gray-400 text-center font-medium italic">
                        Please share these credentials securely with the rector.
                    </p>
                </div>
            )}
        </div>
    );
}
