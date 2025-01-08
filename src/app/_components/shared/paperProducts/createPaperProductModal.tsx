"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PaperBrand, PaperType, PaperFinish } from "@prisma/client";
import { api } from "~/trpc/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/app/_components/ui/dialog";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";
import { SelectField } from "~/app/_components/shared/ui/SelectField/SelectField";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const createPaperProductSchema = z.object({
    brand: z.nativeEnum(PaperBrand).default(PaperBrand.BlazerDigital),
    paperType: z.nativeEnum(PaperType).default(PaperType.Book),
    finish: z.nativeEnum(PaperFinish).default(PaperFinish.Gloss),
    weightLb: z.number().optional(),
    caliper: z.number().optional(),
    size: z.string().optional(),
    customDescription: z.string().optional(),
});

type CreatePaperProductFormData = z.infer<typeof createPaperProductSchema>;

interface CreatePaperProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaperProductCreated: (paperProduct: { id: string }) => void;
}

export const CreatePaperProductModal: React.FC<CreatePaperProductModalProps> = ({
    isOpen,
    onClose,
    onPaperProductCreated,
}) => {
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedPaperType, setSelectedPaperType] = useState("");
    const [selectedFinish, setSelectedFinish] = useState("");

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CreatePaperProductFormData>({
        resolver: zodResolver(createPaperProductSchema),
    });

    const createPaperProduct = api.paperProducts.create.useMutation({
        onSuccess: (paperProduct) => {
            onPaperProductCreated({ id: paperProduct.id });
            onClose();
            reset();
            setSelectedBrand("");
            setSelectedPaperType("");
            setSelectedFinish("");
            toast.success("Paper product created successfully");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleClose = () => {
        reset();
        setSelectedBrand("");
        setSelectedPaperType("");
        setSelectedFinish("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Paper Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit((data) => createPaperProduct.mutate(data))} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Brand</Label>
                        <SelectField
                            options={Object.values(PaperBrand).map(brand => ({
                                label: brand.replace(/([A-Z])/g, ' $1').trim(),
                                value: brand
                            }))}
                            value={selectedBrand}
                            onValueChange={(value) => {
                                setSelectedBrand(value);
                                setValue("brand", value as PaperBrand);
                            }}
                            placeholder="Select brand"
                        />
                        {errors.brand && <p className="text-sm text-red-500">{errors.brand.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Paper Type</Label>
                        <SelectField
                            options={Object.values(PaperType).map(type => ({
                                label: type,
                                value: type
                            }))}
                            value={selectedPaperType}
                            onValueChange={(value) => {
                                setSelectedPaperType(value);
                                setValue("paperType", value as PaperType);
                            }}
                            placeholder="Select paper type"
                        />
                        {errors.paperType && <p className="text-sm text-red-500">{errors.paperType.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Finish</Label>
                        <SelectField
                            options={Object.values(PaperFinish).map(finish => ({
                                label: finish,
                                value: finish
                            }))}
                            value={selectedFinish}
                            onValueChange={(value) => {
                                setSelectedFinish(value);
                                setValue("finish", value as PaperFinish);
                            }}
                            placeholder="Select finish"
                        />
                        {errors.finish && <p className="text-sm text-red-500">{errors.finish.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Weight (lb)</Label>
                        <Input
                            type="number"
                            {...register("weightLb", { valueAsNumber: true })}
                            placeholder="Enter weight"
                        />
                        {errors.weightLb && <p className="text-sm text-red-500">{errors.weightLb.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Caliper</Label>
                        <Input
                            type="number"
                            step="0.1"
                            {...register("caliper", { valueAsNumber: true })}
                            placeholder="Enter caliper"
                        />
                        {errors.caliper && <p className="text-sm text-red-500">{errors.caliper.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Size</Label>
                        <Input
                            {...register("size")}
                            placeholder="Enter size (e.g., 12x18)"
                        />
                        {errors.size && <p className="text-sm text-red-500">{errors.size.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Custom Description</Label>
                        <Input
                            {...register("customDescription")}
                            placeholder="Enter custom description"
                        />
                        {errors.customDescription && <p className="text-sm text-red-500">{errors.customDescription.message}</p>}
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createPaperProduct.isPending}
                        >
                            {createPaperProduct.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 