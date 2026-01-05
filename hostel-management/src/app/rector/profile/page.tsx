import { auth } from "@/auth";
export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { handleLogout, updateProfile, handleRoomChangeRequest } from "../../actions";
import { ImageUpload } from "@/components/ImageUpload";

export default async function RectorProfile() {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") {
        redirect("/login");
    }

    const rectorData = await db.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Administrator Profile</h1>
                    <p className="text-gray-500 mt-1">Manage your administrator account details</p>
                </div>
                <Link
                    href="/rector"
                    className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 rounded-md text-sm font-medium transition-colors"
                >
                    Back to Dashboard
                </Link>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Banner Section */}
                <div className="bg-black p-8 text-white">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {rectorData?.image ? (
                                <img
                                    src={rectorData.image}
                                    alt={rectorData.name || 'Rector'}
                                    className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
                                />
                            ) : (
                                <div className="p-4 bg-white/10 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{rectorData?.name || 'Administrator'}</h2>
                            <p className="text-gray-400 mt-1">{rectorData?.email}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 border border-white/20 rounded text-xs font-bold uppercase tracking-wider">
                                System Rector
                            </span>
                        </div>
                    </div>
                </div>

                {/* Editable Form Section */}
                <form action={updateProfile} className="p-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                            <input
                                name="fullName"
                                defaultValue={rectorData?.profile?.fullName || rectorData?.name || ''}
                                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all"
                                placeholder="Enter full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Number</label>
                            <input
                                name="contactNumber"
                                defaultValue={rectorData?.profile?.contactNumber || ''}
                                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all"
                                placeholder="Enter contact number"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Emergency Contact</label>
                            <input
                                name="guardianContact"
                                defaultValue={rectorData?.profile?.guardianContact || ''}
                                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all"
                                placeholder="Enter emergency contact"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Home Town</label>
                            <input
                                name="homeTown"
                                defaultValue={rectorData?.profile?.homeTown || ''}
                                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all"
                                placeholder="Enter home town"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</label>
                            <textarea
                                name="address"
                                defaultValue={rectorData?.profile?.address || ''}
                                rows={2}
                                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all resize-none"
                                placeholder="Enter full address"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
                            <select
                                name="gender"
                                defaultValue={rectorData?.profile?.gender || ''}
                                className="w-full border-b border-gray-200 bg-transparent py-2 text-sm font-medium focus:border-black outline-none transition-all appearance-none"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 pt-8 border-t border-gray-100">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Profile Photograph</h3>
                            <ImageUpload name="image" defaultValue={rectorData?.image} />
                        </div>
                    </div>

                    <div className="mt-12 flex justify-end">
                        <button
                            type="submit"
                            className="px-8 py-3 bg-black text-white font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-all rounded shadow-sm"
                        >
                            Save Changes
                        </button>
                    </div>

                    {/* Account Info */}
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Account Metadata</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Login Email</label>
                                <p className="text-black font-medium">{rectorData?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Creation Date</label>
                                <p className="text-black font-medium">{new Date(rectorData?.createdAt || '').toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Role</label>
                                <p className="text-black font-medium uppercase tracking-tighter">System Administrator</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Permissions</label>
                                <p className="text-black font-medium">Full Administrative Control</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
