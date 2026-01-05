import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import { db } from "@/lib/db";

export default async function InspectorLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const user = await db.user.findUnique({
        where: { id: session?.user?.id },
        select: { name: true, email: true, image: true }
    });

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar role="INSPECTOR" user={user} />
            <main className="flex-1 ml-64 p-8 bg-white min-h-screen">
                {children}
            </main>
        </div>
    );
}
