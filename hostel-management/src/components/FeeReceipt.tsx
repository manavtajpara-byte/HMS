'use client';

import React, { useRef } from 'react';
import { Printer, Download, ShieldCheck } from 'lucide-react';

type FeeReceiptProps = {
    studentName: string;
    studentEmail: string;
    hostelName: string;
    amount: number;
    receiptNumber: string;
    date: string;
    academicYear: string;
};

export default function FeeReceipt({
    studentName,
    studentEmail,
    hostelName,
    amount,
    receiptNumber,
    date,
    academicYear,
}: FeeReceiptProps) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        if (!receiptRef.current) return;

        // Dynamic import to avoid SSR issues
        const html2pdf = (await import('html2pdf.js')).default;

        const element = receiptRef.current;
        const opt = {
            margin: 0,
            filename: `Receipt_${receiptNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        } as any;

        html2pdf().from(element).set(opt).save();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 print:bg-white print:py-0">
            {/* Action Buttons */}
            <div className="max-w-4xl w-full flex justify-end gap-3 mb-8 print:hidden">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                    <Download size={14} />
                    Download PDF
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                    <Printer size={14} />
                    Print Receipt
                </button>
            </div>

            {/* Receipt Container */}
            <div ref={receiptRef} className="max-w-4xl w-full bg-white border border-gray-200 shadow-2xl rounded-[2.5rem] overflow-hidden print:shadow-none print:border-none print:rounded-none">
                {/* Receipt Header */}
                <div className="bg-black text-white p-12 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                <ShieldCheck size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tighter uppercase">{hostelName}</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter mb-2">TAX INVOICE</h1>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Official Fee Payment Receipt</p>
                    </div>
                    <div className="text-right">
                        <div className="mb-8">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Receipt No.</p>
                            <p className="text-xl font-black tracking-tight font-mono">{receiptNumber}</p>
                        </div>
                        <div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Date of Issue</p>
                            <p className="text-xl font-black tracking-tight">{date}</p>
                        </div>
                    </div>
                </div>

                {/* Receipt Body */}
                <div className="p-12 space-y-12">
                    {/* Student Info */}
                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Billed To</p>
                            <h2 className="text-2xl font-black text-black mb-1">{studentName}</h2>
                            <p className="text-gray-500 font-mono text-xs">{studentEmail}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Academic Session</p>
                            <h2 className="text-2xl font-black text-black">{academicYear}</h2>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-100 rounded-3xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <tr>
                                    <th className="px-8 py-4">Description</th>
                                    <th className="px-8 py-4 text-right">Amount (INR)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr>
                                    <td className="px-8 py-6 font-bold text-black">
                                        Annual Hostel Accommodation Fee
                                        <p className="text-[10px] text-gray-400 font-medium mt-1">Includes room rent, electricity and maintenance charges.</p>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black text-xl">₹{amount.toLocaleString()}</td>
                                </tr>
                                <tr className="bg-black text-white">
                                    <td className="px-8 py-6 font-black uppercase tracking-widest text-xs">Total Amount Paid</td>
                                    <td className="px-8 py-6 text-right font-black text-3xl">₹{amount.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-black">Important Notes</h3>
                            <ul className="text-xs text-gray-500 space-y-2 leading-relaxed">
                                <li className="flex gap-2">
                                    <div className="min-w-[4px] h-[4px] bg-black rounded-full mt-1.5" />
                                    This receipt is computer-generated and does not require a physical signature.
                                </li>
                                <li className="flex gap-2">
                                    <div className="min-w-[4px] h-[4px] bg-black rounded-full mt-1.5" />
                                    Fee once paid is non-refundable except as per hostel policy.
                                </li>
                                <li className="flex gap-2">
                                    <div className="min-w-[4px] h-[4px] bg-black rounded-full mt-1.5" />
                                    Please keep this copy for your permanent academic records.
                                </li>
                            </ul>
                        </div>
                        <div className="flex flex-col items-end justify-end">
                            <div className="w-48 border-b-2 border-black pb-4 text-center">
                                {/* Digital Seal/Stamp placeholder */}
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">Authorized Seal</div>
                            </div>
                            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-black">Administrative Office</p>
                        </div>
                    </div>
                </div>

                {/* Receipt Footer Accent */}
                <div className="h-4 bg-gradient-to-r from-black via-gray-800 to-black" />
            </div>

            <p className="mt-8 text-gray-400 text-[9px] font-black uppercase tracking-widest print:hidden">
                Generated via {hostelName} Management System Biometric Identity Cluster
            </p>
        </div>
    );
}
