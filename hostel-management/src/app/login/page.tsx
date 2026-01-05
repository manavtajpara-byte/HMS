import { Suspense } from 'react';
import { db } from "@/lib/db";
import LoginForm from "@/app/login/LoginForm";

export default async function LoginPage() {
    const hostelSettings = await (db as any).hostelSettings?.findFirst({
        where: { id: "default" }
    }) || { hostelName: "University Hostel" };

    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
            <LoginForm hostelName={hostelSettings.hostelName} />
        </Suspense>
    );
}
