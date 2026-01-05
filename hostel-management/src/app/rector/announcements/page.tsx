import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { createAnnouncement, deleteAnnouncement } from "../../actions";

export default async function RectorAnnouncementsPage() {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") {
        redirect("/login");
    }

    const announcements = await (db as any).announcement?.findMany({
        orderBy: { createdAt: 'desc' }
    }) || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Announcements</h1>
                    <p className="text-gray-500 mt-1">Broadcast important updates to all hostel residents</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Create Form */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-fit">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3">
                        <span className="w-4 h-0.5 bg-black"></span>
                        New Broadcast
                    </h2>
                    <form action={createAnnouncement} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title</label>
                            <input
                                name="title"
                                required
                                placeholder="Enter a catchy title..."
                                className="w-full border-b border-gray-100 bg-transparent py-3 text-sm font-medium focus:border-black outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Content</label>
                            <textarea
                                name="content"
                                required
                                placeholder="Write the announcement details here..."
                                className="w-full border-b border-gray-100 bg-transparent py-3 text-sm font-medium focus:border-black outline-none transition-all resize-none h-32"
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
                            >
                                Publish Announcement
                            </button>
                        </div>
                    </form>
                </div>

                {/* History */}
                <div className="space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                        <span className="w-4 h-0.5 bg-gray-200"></span>
                        Recent Broadcasts
                    </h2>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {announcements.map((ann: any) => (
                            <div key={ann.id} className="p-6 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white transition-all group relative">
                                <div className="absolute top-6 right-6 flex items-center gap-4">
                                    <span className="text-[10px] font-black text-gray-300 uppercase">
                                        {new Date(ann.createdAt).toLocaleDateString()}
                                    </span>
                                    <form action={deleteAnnouncement} className="inline-block">
                                        <input type="hidden" name="announcementId" value={ann.id} />
                                        <button
                                            type="submit"
                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Announcement"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </form>
                                </div>
                                <h3 className="font-bold text-black mb-2 pr-20">{ann.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{ann.content}</p>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Team</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
