'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Banknote, X } from 'lucide-react';
import { useState } from 'react';

type PaymentQRCodeProps = {
    amount: number;
    upiId: string;
    merchantName: string;
};

export default function PaymentQRCode({ amount, upiId, merchantName }: PaymentQRCodeProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Dynamic amount is sometimes tricky with UPI deep links in different apps,
    // but standard am= parameter usually works.
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95"
            >
                <Banknote size={16} />
                Pay Fees Online
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full relative shadow-2xl border border-gray-100 scale-in-center animate-in zoom-in-95 duration-300">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <Banknote size={32} className="text-black" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-black">Scan to Pay</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">UPI Secure Payment</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex justify-center mb-8 group overflow-hidden">
                    <div className="group-hover:scale-105 transition-transform duration-500">
                        <QRCodeSVG value={upiUri} size={200} level="M" />
                    </div>
                </div>

                <div className="space-y-4 text-center">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1">Total Amount</div>
                        <div className="text-3xl font-black text-black">₹{amount.toLocaleString()}</div>
                    </div>

                    <div className="py-4 border-t border-gray-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1">Payable To</div>
                        <div className="text-sm font-bold text-black">{merchantName}</div>
                        <div className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-tighter">{upiId}</div>
                    </div>
                </div>

                <p className="mt-8 text-[9px] text-gray-400 text-center font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Open any UPI App (GPay, PhonePe, etc.)<br />and scan the visual code above
                </p>
            </div>
        </div>
    );
}
