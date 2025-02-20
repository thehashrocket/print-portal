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
            <DialogContent className="max-h-[80vh] sm:max-w-[500px]">
                <DialogHeader className="pb-2">
                    <DialogTitle>Create New Paper Product</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto pr-6 max-h-[calc(80vh-8rem)]">
                    <form onSubmit={handleSubmit((data) => createPaperProduct.mutate(data))} className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                                <Label className="text-sm">Brand</Label>
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
                                {errors.brand && <p className="text-xs text-red-500">{errors.brand.message}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label className="text-sm">Paper Type</Label>
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
                                {errors.paperType && <p className="text-xs text-red-500">{errors.paperType.message}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label className="text-sm">Finish</Label>
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
                                {errors.finish && <p className="text-xs text-red-500">{errors.finish.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-sm">Weight (lb)</Label>
                                    <Input
                                        type="number"
                                        {...register("weightLb", { valueAsNumber: true })}
                                        placeholder="Enter weight"
                                        className="h-8"
                                    />
                                    {errors.weightLb && <p className="text-xs text-red-500">{errors.weightLb.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-sm">Caliper</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        {...register("caliper", { valueAsNumber: true })}
                                        placeholder="Enter caliper"
                                        className="h-8"
                                    />
                                    {errors.caliper && <p className="text-xs text-red-500">{errors.caliper.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-sm">Size</Label>
                                <Input
                                    {...register("size")}
                                    placeholder="Enter size (e.g., 12x18)"
                                    className="h-8"
                                />
                                {errors.size && <p className="text-xs text-red-500">{errors.size.message}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label className="text-sm">Custom Description</Label>
                                <Input
                                    {...register("customDescription")}
                                    placeholder="Enter custom description"
                                    className="h-8"
                                />
                                {errors.customDescription && <p className="text-xs text-red-500">{errors.customDescription.message}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="h-8 px-3"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createPaperProduct.isPending}
                                className="h-8 px-3"
                            >
                                {createPaperProduct.isPending && (
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                )}
                                Create
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 