import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { handleRoomChangeRequest } from "../../actions";

export default async function RectorRoomRequestsPage() {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") {
        redirect("/login");
    }

    const roomRequests = await (db as any).roomChangeRequest?.findMany({
        where: { status: 'PENDING' },
        include: {
            student: true,
            requestedRoom: true
        },
        orderBy: { createdAt: 'desc' }
    }) || [];

    const historyItems = await (db as any).roomChangeRequest?.findMany({
        where: { status: { not: 'PENDING' } },
        include: {
            student: true,
            requestedRoom: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    }) || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Room Requests</h1>
                    <p className="text-gray-500 mt-1">Review and manage student relocation submissions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                        <span className="w-4 h-0.5 bg-black"></span>
                        Active Requests ({roomRequests.length})
                    </h2>

                    {roomRequests.length > 0 ? (
                        <div className="space-y-4">
                            {roomRequests.map((request: any) => (
                                <div key={request.id} className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-black">
                                                {request.student.name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-black">{request.student.name}</h3>
                                                <p className="text-[10px] text-gray-400 uppercase font-black">{request.student.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black uppercase text-gray-400">Target Room</div>
                                            <div className="font-bold text-black">Room {request.requestedRoom.number}</div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Reason for Relocation</p>
                                        <p className="text-sm text-gray-600 italic">"{request.reason}"</p>
                                    </div>

                                    <form action={handleRoomChangeRequest} className="space-y-4">
                                        <input type="hidden" name="requestId" value={request.id} />

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Response Message (Optional)</label>
                                            <textarea
                                                name="rectorMessage"
                                                placeholder="Add a message for the student..."
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all resize-none h-20"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button
                                                name="status"
                                                value="REJECTED"
                                                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                name="status"
                                                value="APPROVED"
                                                className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                                            >
                                                Approve Relocation
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                            <p className="text-gray-400 italic">No pending room change requests</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                        <span className="w-4 h-0.5 bg-gray-200"></span>
                        Recent Decisions
                    </h2>
                    <div className="space-y-3">
                        {historyItems.map((item: any) => (
                            <div key={item.id} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-black text-xs">{item.student.name}</div>
                                    <div className="text-[10px] text-gray-400">Room {item.requestedRoom.number}</div>
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded ${item.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
