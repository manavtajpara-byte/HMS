'use client';

import React, { useState } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle2, Circle } from 'lucide-react';
import { markNotificationAsRead } from '@/app/actions';

type Notification = {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: Date;
};

export default function NotificationCenter({ notifications }: { notifications: Notification[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black hover:bg-white transition-all relative border border-gray-100"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black">System Notifications</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                            {notifications.length === 0 && (
                                <div className="p-12 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No Notifications</p>
                                </div>
                            )}
                            {notifications.map((n) => (
                                <div key={n.id} className={`p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all flex gap-4 ${n.read ? 'opacity-60' : ''}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.type === 'WARNING' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        {n.type === 'WARNING' ? <AlertTriangle size={14} /> : <Info size={14} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-[11px] font-black text-black">{n.title}</h4>
                                            {!n.read && (
                                                <button onClick={() => handleMarkAsRead(n.id)} className="text-[8px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700">
                                                    Read
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 leading-relaxed">{n.message}</p>
                                        <p className="text-[8px] text-gray-300 mt-2 font-black uppercase">{new Date(n.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
