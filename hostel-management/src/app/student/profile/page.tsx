import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function StudentProfileRedirect() {
    const session = await auth();
    if (!session || !session.user?.id) {
        redirect("/login");
    }

    redirect(`/student/profile/${session.user.id}`);
}
