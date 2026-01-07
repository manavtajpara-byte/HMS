import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-[#FDFDFC]">
            <Sidebar role="ADMIN" user={session.user as any} />
            <main className="flex-1 ml-64 p-12 transition-all duration-700 ease-in-out">
                {children}
            </main>
        </div>
    );
}
