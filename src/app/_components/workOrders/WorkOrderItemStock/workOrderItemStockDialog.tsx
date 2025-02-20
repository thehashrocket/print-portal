import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/app/_components/ui/dialog';
import { Button } from '~/app/_components/ui/button';
import WorkOrderItemStockForm from './workOrderItemStockForm';
import { useWorkOrderItemStockStore } from '~/app/store/workOrderItemStockStore';
import { type TempWorkOrderItemStock } from '~/app/store/workOrderItemStockStore';

interface WorkOrderItemStockDialogProps {
    onStockAdded?: () => void;
}

export const WorkOrderItemStockDialog: React.FC<WorkOrderItemStockDialogProps> = ({
    onStockAdded
}) => {
    const [open, setOpen] = React.useState(false);
    const addTempStock = useWorkOrderItemStockStore((state) => state.addTempStock);

    const handleStockSubmit = (stockData: TempWorkOrderItemStock) => {
        addTempStock(stockData);
        setOpen(false);
        onStockAdded?.();
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };

    const handleTriggerClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    onClick={handleTriggerClick}
                    type="button"
                    className="h-8 px-3"
                >
                    Add Paper Stock
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader className="pb-2">
                    <DialogTitle>Add Paper Stock</DialogTitle>
                </DialogHeader>
                <WorkOrderItemStockForm
                    workOrderItemId=""
                    stockId={null}
                    onSuccess={handleStockSubmit}
                    onCancel={() => setOpen(false)}
                    isTemporary={true}
                />
            </DialogContent>
        </Dialog>
    );
}; 