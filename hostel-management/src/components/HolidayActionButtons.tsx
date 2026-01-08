'use client';

import { approveMessHoliday } from "@/app/actions";
import { Check, X } from "lucide-react";
import { useState } from "react";

export default function HolidayActionButtons({ holidayId }: { holidayId: string }) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = async (status: "APPROVED" | "REJECTED") => {
        setLoading(status);
        try {
            await approveMessHoliday(holidayId, status);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex gap-4">
            <button
                onClick={() => handleAction("APPROVED")}
                disabled={!!loading}
                className="flex-1 h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
                <Check size={14} strokeWidth={3} />
                {loading === 'APPROVED' ? '...' : 'Approve'}
            </button>
            <button
                onClick={() => handleAction("REJECTED")}
                disabled={!!loading}
                className="flex-1 h-14 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
            >
                <X size={14} strokeWidth={3} />
                {loading === 'REJECTED' ? '...' : 'Decline'}
            </button>
        </div>
    );
}
