import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/app/_components/ui/dialog';
import { Button } from '~/app/_components/ui/button';
import { CreatePaperProductForm } from '~/app/_components/shared/paperProducts/createPaperProductForm';

interface PaperProductDialogProps {
    onPaperProductCreated: (paperProduct: { id: string }) => void;
    trigger?: React.ReactNode;
}

export const PaperProductDialog: React.FC<PaperProductDialogProps> = ({
    onPaperProductCreated,
    trigger
}) => {
    const [open, setOpen] = React.useState(false);

    const handleSuccess = (paperProduct: { id: string }) => {
        onPaperProductCreated(paperProduct);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button 
                        variant="outline" 
                        type="button"
                        className="w-full"
                    >
                        Create New Paper Product
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Create New Paper Product</DialogTitle>
                </DialogHeader>
                <CreatePaperProductForm
                    onSuccess={handleSuccess}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}; 