import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { submitRoomChangeRequest } from "../../actions";

export default async function StudentRoomsPage() {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") {
        redirect("/login");
    }

    const studentData = await db.user.findUnique({
        where: { id: session.user.id },
        include: { profile: { include: { room: true } } }
    });

    const allRooms = await db.room.findMany({
        include: { occupants: true },
        orderBy: { number: 'asc' }
    });
    const vacantRooms = allRooms.filter(r => r.occupants.length < r.capacity);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Room Management</h1>
                    <p className="text-gray-500 mt-1">View available rooms and request relocation</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Current Room Info */}
                <div className="md:col-span-1">
                    <div className="bg-black text-white rounded-lg p-6 shadow-xl">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Current Assignment</h2>
                        {studentData?.profile?.room ? (
                            <div className="space-y-4">
                                <div className="text-4xl font-black">Room {studentData.profile.room.number}</div>
                                <div className="space-y-1">
                                    <p className="text-sm opacity-60">Type: {studentData.profile.room.type.replace('_', ' ')}</p>
                                    <p className="text-sm opacity-60">Hostel: Main Block</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No room assigned yet.</p>
                        )}
                    </div>
                </div>

                {/* Room Change Form */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 uppercase tracking-widest text-[10px] font-bold text-gray-500">
                            Relocation Request
                        </div>
                        <form action={submitRoomChangeRequest} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Requested Room</label>
                                    <select
                                        name="requestedRoomId"
                                        required
                                        className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all appearance-none"
                                    >
                                        <option value="">Choose a vacant room...</option>
                                        {vacantRooms
                                            .filter(r => r.id !== studentData?.profile?.roomId)
                                            .map(room => (
                                                <option key={room.id} value={room.id}>
                                                    Room {room.number} ({room.type.replace('_', ' ')}) - {room.capacity - room.occupants.length} slots left
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason for Change</label>
                                    <textarea
                                        name="reason"
                                        required
                                        placeholder="Explain why you want to change rooms..."
                                        className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all resize-none h-24"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded shadow-lg shadow-black/10"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Vacant Rooms List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-black">Live Vacancy List</h2>
                    <p className="text-gray-500 text-sm mt-1">Real-time availability across all hostel blocks</p>
                </div>
                <div className="p-6">
                    {vacantRooms.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {vacantRooms.map((room) => (
                                <div key={room.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:border-black transition-all group">
                                    <p className="text-sm font-bold text-black">Room {room.number}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-1">
                                        {room.occupants.length} / {room.capacity} Occupied
                                    </p>
                                    <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-black transition-all duration-500"
                                            style={{ width: `${(room.occupants.length / room.capacity) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic text-center py-8">No vacant rooms available at the moment.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
