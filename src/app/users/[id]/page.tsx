// ~/app/users/[id]/page.tsx
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import UserProfileComponent from "~/app/_components/users/userProfile";


export default async function UserProfilePage({ params }: { params: { id: string } }) {
    const session = await getServerAuthSession();

    if (!session) {
        redirect("/api/auth/signin");
    }

    return (
        <UserProfileComponent params={params} session={session} />
    );
}