"use client";

import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginForm({ hostelName }: { hostelName: string }) {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
    const searchParams = useSearchParams();
    const signupSuccess = searchParams.get('signup') === 'success';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white relative selection:bg-black selection:text-white font-sans overflow-hidden">
            {/* Minimalist Monochrome Background */}
            <div className="absolute inset-0 z-0 opacity-[0.03]">
                <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,_#000_0,_#000_1px,_transparent_0,_transparent_50%)] bg-[length:10px_10px]" />
            </div>

            <div className="z-10 w-full max-w-sm space-y-12 p-8 border border-black/5 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-2xl">
                <div className="text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-black uppercase tracking-tighter">Identity Check</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            Branch: <span className="text-black">{hostelName}</span>
                        </p>
                    </div>
                </div>

                {signupSuccess && (
                    <div className="bg-black text-white p-4 text-center animate-in fade-in zoom-in duration-500 rounded-lg">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Credentials Initialized. Proceed to Login.</p>
                    </div>
                )}

                <form action={formAction} className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
                                Global Identifier
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full border-b-2 border-gray-100 bg-transparent py-3 text-sm font-bold text-black placeholder-gray-200 focus:border-black focus:outline-none transition-all"
                                placeholder="USER@DOMAIN.EDU"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
                                Passcode
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full border-b-2 border-gray-100 bg-transparent py-3 text-sm font-bold text-black placeholder-gray-200 focus:border-black focus:outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative flex w-full justify-center bg-black px-4 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-gray-900 active:scale-[0.98] shadow-2xl disabled:bg-gray-200"
                        >
                            {isPending ? (
                                <span className="flex items-center gap-3">
                                    <svg className="h-3 w-3 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Authenticating
                                </span>
                            ) : 'Initialize Session'}
                        </button>
                    </div>

                    <div className="flex h-4 items-center justify-center" aria-live="polite" aria-atomic="true">
                        {errorMessage && (
                            <p className="text-[9px] font-black text-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded">Error: {errorMessage}</p>
                        )}
                    </div>
                </form>

                <div className="text-center">
                    <Link href="/signup" className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-black transition-colors">
                        Request New Access Protocol
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 text-[9px] font-black text-gray-200 uppercase tracking-[0.5em]">
                Secure Encryption Active
            </div>
        </div>
    );
}
