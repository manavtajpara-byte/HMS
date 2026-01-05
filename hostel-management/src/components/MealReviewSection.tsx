'use client';

import { submitMealReview } from "@/app/actions";
import { useState } from "react";
import { useFormStatus } from "react-dom";

type MealReviewSectionProps = {
    existingReviews: { mealType: string }[];
};

export default function MealReviewSection({ existingReviews }: MealReviewSectionProps) {
    // Determine which meals have been reviewed
    const reviewedMeals = new Set(existingReviews.map(r => r.mealType));

    // Determine current time for UI (client-side matching server logic roughly)
    // Server validation is source of truth, but UI can disable buttons
    const now = new Date();
    const currentHour = now.getHours();

    const getStatus = (mealType: string) => {
        if (reviewedMeals.has(mealType)) return "SUBMITTED";
        if (mealType === "BREAKFAST" && currentHour >= 7 && currentHour < 11) return "OPEN";
        if (mealType === "LUNCH" && currentHour >= 12 && currentHour < 16) return "OPEN";
        if (mealType === "DINNER" && currentHour >= 19 && currentHour < 23) return "OPEN";
        return "CLOSED";
    };

    const meals = [
        {
            id: "BREAKFAST",
            label: "Breakfast",
            icon: "🍳",
            desc: "7:00 AM - 11:00 AM"
        },
        {
            id: "LUNCH",
            label: "Lunch",
            icon: "🍛",
            desc: "12:00 PM - 4:00 PM"
        },
        {
            id: "DINNER",
            label: "Dinner",
            icon: "🌙",
            desc: "7:00 PM - 11:00 PM"
        }
    ];

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-3xl">🍽️</span> Daily Meal Reviews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {meals.map((meal) => {
                    const status = getStatus(meal.id);
                    return (
                        <MealCard
                            key={meal.id}
                            meal={meal}
                            status={status}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function MealCard({ meal, status }: { meal: any, status: string }) {
    const isOpen = status === "OPEN";
    const isSubmitted = status === "SUBMITTED";

    return (
        <div className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${isOpen ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-200 opacity-60'
            }`}>
            <div className="p-6 h-full flex flex-col bg-white">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full text-2xl border border-gray-100 bg-gray-50`}>
                        {meal.icon}
                    </div>
                    {isSubmitted && (
                        <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-black">
                            ✓ Terminated
                        </span>
                    )}
                    {!isOpen && !isSubmitted && (
                        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded border border-gray-200">
                            Closed
                        </span>
                    )}
                    {isOpen && (
                        <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                            Live
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-black mb-1 uppercase tracking-tight">{meal.label}</h3>
                <p className="text-sm text-gray-500 mb-6 font-medium">{meal.desc}</p>

                <div className="mt-auto">
                    {isOpen ? (
                        <ReviewForm mealType={meal.id} />
                    ) : isSubmitted ? (
                        <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
                            <p className="font-bold text-sm text-black">Feedback Recorded</p>
                        </div>
                    ) : (
                        <div className="text-center bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <p className="text-gray-400 text-xs font-bold uppercase">Window Closed</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ReviewForm({ mealType }: { mealType: string }) {
    return (
        <form action={submitMealReview} className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-inner">
            <input type="hidden" name="mealType" value={mealType} />

            <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Rating</label>
                <div className="flex gap-2 justify-center bg-white rounded-lg p-2 shadow-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <label key={star} className="cursor-pointer hover:scale-110 transition-transform">
                            <input
                                type="radio"
                                name="rating"
                                value={star}
                                className="peer sr-only"
                                required
                            />
                            <span className="text-2xl grayscale peer-checked:grayscale-0 peer-checked:scale-125 transition-all block text-yellow-400">
                                ⭐
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-3">
                <input
                    name="comment"
                    placeholder="Any comments? (Optional)"
                    className="w-full text-sm p-2 rounded-lg border-none bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-300 transition-all placeholder-gray-500"
                />
            </div>

            <SubmitButton />
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            disabled={pending}
            className="w-full bg-gray-900 hover:bg-black text-white py-2 rounded-lg font-medium text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
            {pending ? (
                <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Sending...
                </>
            ) : (
                "Submit Review"
            )}
        </button>
    );
}
