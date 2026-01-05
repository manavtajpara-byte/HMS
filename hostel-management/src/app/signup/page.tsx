"use client";

import { useActionState } from "react";
import { signUp } from "../actions";
import Link from "next/link";

export default function SignUpPage() {
    const [errorMessage, formAction, isPending] = useActionState(signUp, undefined);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white text-black font-sans selection:bg-black selection:text-white">
            {/* Minimalist Monochrome Background */}
            <div className="absolute inset-0 z-0 opacity-[0.03]">
                <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] bg-[repeating-linear-gradient(90deg,_#000_0,_#000_1px,_transparent_0,_transparent_40px)]" />
            </div>

            <div className="relative z-10 w-full max-w-sm px-6">
                <div className="mb-12 text-center space-y-4">
                    <Link href="/" className="inline-block group transition-transform duration-500 hover:scale-105">
                        <span className="text-4xl font-black tracking-tighter text-black uppercase">
                            Hostel<span className="text-gray-300">Hub</span>
                        </span>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-xl font-black text-black uppercase tracking-widest">Enrollment Protocol</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Institutional Access Registration</p>
                    </div>
                </div>

                <div className="p-8 border border-black/5 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-2xl">
                    <form action={formAction} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1" htmlFor="name">
                                    Legal Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="FULL NAME"
                                    className="block w-full border-b-2 border-gray-100 bg-transparent py-3 text-sm font-bold text-black placeholder-gray-200 focus:border-black focus:outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1" htmlFor="email">
                                    Official Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="USER@DOMAIN.EDU"
                                    className="block w-full border-b-2 border-gray-100 bg-transparent py-3 text-sm font-bold text-black placeholder-gray-200 focus:border-black focus:outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1" htmlFor="password">
                                    Access Key
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="block w-full border-b-2 border-gray-100 bg-transparent py-3 text-sm font-bold text-black placeholder-gray-200 focus:border-black focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="group relative flex w-full items-center justify-center bg-black px-4 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-gray-900 active:scale-[0.98] shadow-2xl disabled:bg-gray-200"
                            >
                                {isPending ? (
                                    <span className="flex items-center gap-3">
                                        <svg className="h-3 w-3 animate-spin text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing
                                    </span>
                                ) : (
                                    "Commit Activation"
                                )}
                            </button>
                        </div>

                        <div className="flex h-4 items-center justify-center" aria-live="polite" aria-atomic="true">
                            {errorMessage && (
                                <p className="text-[9px] font-black text-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded">
                                    Error: {errorMessage}
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/login" className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-black transition-colors">
                        Existing Identity Found? Sign In
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 text-[9px] font-black text-gray-200 uppercase tracking-[0.5em]">
                System Enrollment v2.0
            </div>
        </main>
    );
}
