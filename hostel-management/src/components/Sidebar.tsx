'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, LogOut, ClipboardList, Activity, Utensils, Bell, Users, Bed, GitPullRequest, Banknote, Calendar } from 'lucide-react';
import { signOut as nextAuthSignOut } from 'next-auth/react';

type SidebarProps = {
    role: 'STUDENT' | 'RECTOR' | 'INSPECTOR' | 'ADMIN';
    user?: {
        name: string | null;
        email: string;
        image: string | null;
    } | null;
};

export function Sidebar({ role, user }: SidebarProps) {
    const pathname = usePathname();
    const basePath = role === 'STUDENT' ? '/student' : role === 'RECTOR' ? '/rector' : role === 'ADMIN' ? '/admin' : '/inspector';

    const links = [
        { href: basePath, label: 'Dashboard', icon: Home },
        { href: `${basePath}/profile`, label: 'Profile', icon: User },
    ];

    if (role === 'STUDENT') {
        links.push(
            { href: '/student/directory', label: 'Directory', icon: ClipboardList },
            { href: '/student/meals', label: 'Meal Reviews', icon: Utensils },
            { href: '/student/holidays', label: 'Mess Holiday', icon: Calendar },
            { href: '/student/movement', label: 'Movement', icon: Activity },
            { href: '/student/rooms', label: 'Room Change', icon: Bed },
            { href: '/student/fees', label: 'Fees', icon: Banknote }
        );
    } else if (role === 'RECTOR') {
        links.push(
            { href: '/rector/students', label: 'Students', icon: Users },
            { href: '/rector/fees', label: 'Fees', icon: Banknote },
            { href: '/rector/holidays', label: 'Holiday Approvals', icon: Calendar },
            { href: '/rector/movement', label: 'Movement Logs', icon: Activity },
            { href: '/rector/meals', label: 'Meal Analytics', icon: Utensils },
            { href: '/rector/announcements', label: 'Announcements', icon: Bell },
            { href: '/rector/room-requests', label: 'Room Requests', icon: GitPullRequest }
        );
    } else if (role === 'INSPECTOR') {
        links.push(
            { href: '/inspector', label: 'Audit Hub', icon: ClipboardList }
        );
    } else if (role === 'ADMIN') {
        links.push(
            { href: '/admin/rectors', label: 'Manage Rectors', icon: Users },
            { href: '/admin/settings', label: 'Global Settings', icon: GitPullRequest }
        );
    }

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-black text-white flex flex-col z-50 shadow-[40px_0_60px_-15px_rgba(0,0,0,0.3)] border-r border-white/5">
            <div className="p-8">
                <div className="flex items-center gap-4 mb-10">
                    <div className="relative">
                        {user?.image ? (
                            <img
                                src={user.image}
                                alt={user.name || 'User'}
                                className="w-10 h-10 rounded-full object-cover grayscale brightness-125 border border-white/20 shadow-2xl"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <User size={16} className="text-white/40" />
                            </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white border-2 border-black rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="text-xs font-black text-white truncate uppercase tracking-widest">{user?.name || 'User'}</h2>
                        <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] mt-0.5">{role}</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[9px] font-black tracking-[0.3em] text-white/20 uppercase mb-4">Core Systems</p>
                    <nav className="space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500 group relative ${isActive
                                        ? 'bg-white text-black font-black'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-black' : 'group-hover:scale-110 transition-all duration-500'} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">{link.label}</span>
                                    {isActive && (
                                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full blur-[2px]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <div className="mt-auto p-8 border-t border-white/5 bg-gradient-to-t from-white/5 to-transparent">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6 group cursor-default">
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-1.5 group-hover:text-white/40 transition-colors">Access Profile</p>
                    <p className="text-[11px] text-white/60 font-medium truncate font-mono">{user?.email}</p>
                </div>

                <button
                    onClick={() => nextAuthSignOut({ callbackUrl: '/login' })}
                    className="w-full h-11 flex items-center justify-center gap-3 rounded-lg text-white/30 hover:text-white hover:bg-white/10 border border-white/5 transition-all duration-500 group overflow-hidden"
                >
                    <div className="relative">
                        <LogOut size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate</span>
                </button>
            </div>
        </aside>
    );
}
