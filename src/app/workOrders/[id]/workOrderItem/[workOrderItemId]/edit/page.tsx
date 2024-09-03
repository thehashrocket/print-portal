import { notFound } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import EditWorkOrderItemComponent from "~/app/_components/workOrders/workOrderItem/edit/editWorkOrderItemComponent";

export default async function EditWorkOrderItemPage({
    params,
}: {
    params: { workOrderItemId: string };
}) {
    const session = await getServerAuthSession();
    if (!session) {
        return "You do not have permission to view this page";
    }

    return (
        <>
            <EditWorkOrderItemComponent workOrderItemId={params.workOrderItemId} />
        </>
    )
}
