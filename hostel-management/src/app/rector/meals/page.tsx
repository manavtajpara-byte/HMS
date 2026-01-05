import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function RectorMealsPage() {
    const session = await auth();
    if (session?.user?.role !== "RECTOR") {
        redirect("/login");
    }



    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reviews = await (db as any).mealReview?.findMany({
        where: { date: today },
        select: { mealType: true, rating: true }
    }) || [];

    const stats = {
        BREAKFAST: { count: 0, sum: 0 },
        LUNCH: { count: 0, sum: 0 },
        DINNER: { count: 0, sum: 0 }
    };

    reviews.forEach((r: any) => {
        if (stats[r.mealType as keyof typeof stats]) {
            stats[r.mealType as keyof typeof stats].count++;
            stats[r.mealType as keyof typeof stats].sum += r.rating;
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Meal Analytics</h1>
                    <p className="text-gray-500 mt-1">Monitor dining hall participation and quality ratings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Object.entries(stats).map(([type, data]) => (
                    <div key={type} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:border-black transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{type}</span>
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M12 2v20" /><path d="M18 6H6" /><path d="M6 12h12" /><path d="M18 18H6" /></svg>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-4xl font-black text-black">{data.count}</div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Responses Today</p>
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-50 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Avg Rating</p>
                                <div className="text-xl font-bold">{data.count > 0 ? (data.sum / data.count).toFixed(1) : '0.0'}</div>
                            </div>
                            <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${data.count > 0 && (data.sum / data.count) >= 4 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                                }`}>
                                {data.count > 0 && (data.sum / data.count) >= 4 ? 'High Quality' : 'Normal'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
}
