import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import MealReviewSection from "@/components/MealReviewSection";

export default async function StudentMealsPage() {
    const session = await auth();
    if (session?.user?.role !== "STUDENT") {
        redirect("/login");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingReviews = await (db as any).mealReview?.findMany({
        where: {
            studentId: session.user.id,
            date: today
        },
        select: { mealType: true }
    }) || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">Meal Reviews</h1>
                    <p className="text-gray-500 mt-1">Submit and track your daily mess experience</p>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                <MealReviewSection existingReviews={existingReviews} />
            </div>
        </div>
    );
}
