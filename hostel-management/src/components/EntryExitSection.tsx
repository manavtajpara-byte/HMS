'use client';

import { logMovement } from "@/app/actions";
import { useFormStatus } from "react-dom";
import { useState } from "react";

type EntryExitSectionProps = {
    latestLog: { type: string; timestamp: Date } | null;
};

export default function EntryExitSection({ latestLog }: EntryExitSectionProps) {
    const isOut = latestLog?.type === "EXIT";

    return (
        <div className="border border-gray-200 rounded-lg p-6 bg-white mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-black">
                <span className="text-2xl">🏃</span> Entry/Exit Log
            </h2>

            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Current Status</p>
                    <div className={`text-2xl font-bold flex items-center gap-2 ${isOut ? 'text-red-600' : 'text-green-600'}`}>
                        {isOut ? (
                            <>
                                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                                OUT OF HOSTEL
                            </>
                        ) : (
                            <>
                                <span className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></span>
                                IN HOSTEL
                            </>
                        )}
                    </div>
                    {latestLog && (
                        <p className="text-xs text-gray-400 mt-2">
                            Last update: {new Date(latestLog.timestamp).toLocaleString()}
                        </p>
                    )}
                </div>

                <div className="w-full md:w-auto">
                    {isOut ? (
                        <form action={logMovement}>
                            <input type="hidden" name="type" value="ENTRY" />
                            <SubmitButton label="Log Entry (Return)" color="bg-black hover:bg-gray-800" />
                        </form>
                    ) : (
                        <ExitForm />
                    )}
                </div>
            </div>
        </div>
    );
}

function ExitForm() {
    const [showReason, setShowReason] = useState(false);

    if (!showReason) {
        return (
            <button
                onClick={() => setShowReason(true)}
                className="w-full md:w-auto px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-md"
            >
                Log Exit
            </button>
        );
    }

    return (
        <form action={logMovement} className="flex flex-col gap-3 w-full md:min-w-[300px] animate-in slide-in-from-right duration-300">
            <input type="hidden" name="type" value="EXIT" />

            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Reason for Exit</label>
                <input
                    name="reason"
                    required
                    placeholder="e.g., Market, Class, Home"
                    className="w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                    autoFocus
                />
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setShowReason(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-100 text-sm"
                >
                    Cancel
                </button>
                <SubmitButton label="Confirm Exit" color="bg-black hover:bg-gray-800" />
            </div>
        </form>
    );
}

function SubmitButton({ label, color }: { label: string, color: string }) {
    const { pending } = useFormStatus();

    return (
        <button
            disabled={pending}
            className={`flex-1 px-6 py-2 text-white font-bold rounded-lg text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
        >
            {pending ? "Processing..." : label}
        </button>
    );
}
