import { getServerAuthSession } from "~/server/auth";
import EditWorkOrderItemComponent from "~/app/_components/workOrders/workOrderItem/edit/editWorkOrderItemComponent";

export default async function EditWorkOrderItemPage(
    props: {
        params: Promise<{ workOrderItemId: string }>;
    }
) {
    const params = await props.params;
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
