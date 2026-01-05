import Link from "next/link";
import { db } from "@/lib/db";
import { User, Activity } from "lucide-react";

export default async function Home() {
  const hostelSettings = await (db as any).hostelSettings?.findFirst({
    where: { id: "default" }
  }) || { hostelName: "University Hostel" };
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white text-black font-sans">
      {/* Dynamic Monochrome Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#eeeeee_0%,_transparent_70%)]" />
        <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gray-100 blur-[100px]" />
        <div className="absolute top-[30%] -right-[10%] h-[600px] w-[600px] rounded-full bg-gray-200 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-black bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-black">
          <span className="mr-3 flex h-1.5 w-1.5 bg-black rounded-full animate-pulse"></span>
          Authenticated Infrastructure
        </div>

        <h1 className="text-7xl font-black tracking-tighter text-black sm:text-9xl mb-8 uppercase leading-[0.85]">
          {hostelSettings.hostelName}
        </h1>

        <p className="mx-auto mb-16 max-w-2xl text-lg font-bold text-gray-400 uppercase tracking-wide leading-relaxed">
          Standardizing student living through minimalist design and efficient administration.
        </p>

        <div className="mb-20 grid gap-8 sm:grid-cols-3">
          {[
            { title: "Residents", desc: "Digital Identity", icon: <User size={24} /> },
            { title: "Governance", desc: "Strict Oversight", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
            { title: "Protocol", desc: "Automated Logic", icon: <Activity size={24} /> }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center border-t border-black/5 pt-8 group cursor-default text-center">
              <div className="mb-4 text-black group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>
              <h3 className="text-sm font-black text-black uppercase tracking-widest mb-1">{item.title}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6">
          <Link
            href="/login"
            className="group relative inline-flex items-center justify-center overflow-hidden bg-black px-12 py-5 text-sm font-black uppercase tracking-[0.3em] text-white transition-all duration-500 hover:tracking-[0.4em] active:scale-95 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
          >
            Access Terminal
          </Link>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Proprietary Management System v2.0</p>
        </div>
      </div>
    </main>
  );
}
