import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '~/trpc/react';
import { PaperBrand, PaperType, PaperFinish } from '@prisma/client';
import { Button } from '~/app/_components/ui/button';
import { Input } from '~/app/_components/ui/input';
import { Label } from '~/app/_components/ui/label';
import { SelectField } from '~/app/_components/shared/ui/SelectField/SelectField';

const paperProductSchema = z.object({
    brand: z.nativeEnum(PaperBrand),
    paperType: z.nativeEnum(PaperType),
    finish: z.nativeEnum(PaperFinish),
    weightLb: z.number().int().min(1),
    size: z.string().min(1),
    width: z.number().optional(),
    height: z.number().optional(),
    mWeight: z.number().optional(),
    sheetsPerUnit: z.number().int().optional(),
    referenceId: z.string().optional(),
    isHPIndigo: z.boolean().default(false),
    supplier: z.string().optional(),
    customDescription: z.string().optional(),
});

type PaperProductFormData = z.infer<typeof paperProductSchema>;

interface CreatePaperProductFormProps {
    onSuccess: (paperProduct: { id: string }) => void;
    onCancel: () => void;
}

export const CreatePaperProductForm: React.FC<CreatePaperProductFormProps> = ({
    onSuccess,
    onCancel,
}) => {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PaperProductFormData>({
        resolver: zodResolver(paperProductSchema),
        defaultValues: {
            brand: PaperBrand.Other,
            paperType: PaperType.Other,
            finish: PaperFinish.Other,
            isHPIndigo: false,
        },
    });

    const createPaperProduct = api.paperProducts.create.useMutation({
        onSuccess: (data) => {
            onSuccess(data);
        },
    });

    const onSubmit = async (data: PaperProductFormData) => {
        try {
            const formattedData = {
                ...data,
                referenceId: data.referenceId?.trim() || undefined,
                supplier: data.supplier?.trim() || undefined,
                customDescription: data.customDescription?.trim() || undefined,
                width: data.width || undefined,
                height: data.height || undefined,
                mWeight: data.mWeight || undefined,
                sheetsPerUnit: data.sheetsPerUnit || undefined,
            };
            
            await createPaperProduct.mutateAsync(formattedData);
        } catch (error) {
            console.error('Error creating paper product:', error);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
    };

    return (
        <div className="max-h-[calc(80vh-8rem)] overflow-y-auto pr-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm">Brand</Label>
                        <SelectField
                            options={Object.values(PaperBrand).map((brand) => ({
                                value: brand,
                                label: brand,
                            }))}
                            value={watch('brand')}
                            onValueChange={(value) => setValue('brand', value as PaperBrand)}
                            placeholder="Select brand..."
                            required
                        />
                        {errors.brand && <span className="text-xs text-red-500">{errors.brand.message}</span>}
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm">Paper Type</Label>
                        <SelectField
                            options={Object.values(PaperType).map((type) => ({
                                value: type,
                                label: type,
                            }))}
                            value={watch('paperType')}
                            onValueChange={(value) => setValue('paperType', value as PaperType)}
                            placeholder="Select paper type..."
                            required
                        />
                        {errors.paperType && <span className="text-xs text-red-500">{errors.paperType.message}</span>}
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm">Finish</Label>
                        <SelectField
                            options={Object.values(PaperFinish).map((finish) => ({
                                value: finish,
                                label: finish,
                            }))}
                            value={watch('finish')}
                            onValueChange={(value) => setValue('finish', value as PaperFinish)}
                            placeholder="Select finish..."
                            required
                        />
                        {errors.finish && <span className="text-xs text-red-500">{errors.finish.message}</span>}
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm">Weight (lb)</Label>
                        <Input
                            type="number"
                            {...register('weightLb', { valueAsNumber: true })}
                            placeholder="Enter weight..."
                            className="h-8"
                        />
                        {errors.weightLb && <span className="text-xs text-red-500">{errors.weightLb.message}</span>}
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm">Size</Label>
                        <Input 
                            {...register('size')} 
                            placeholder="Enter size (e.g., 12x18)..." 
                            className="h-8"
                        />
                        {errors.size && <span className="text-xs text-red-500">{errors.size.message}</span>}
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm">Width (inches)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            {...register('width', { valueAsNumber: true })}
                            placeholder="Enter width..."
                            className="h-8"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm">Height (inches)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            {...register('height', { valueAsNumber: true })}
                            placeholder="Enter height..."
                            className="h-8"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm">M Weight</Label>
                        <Input
                            type="number"
                            step="0.01"
                            {...register('mWeight', { valueAsNumber: true })}
                            placeholder="Enter M weight..."
                            className="h-8"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm">Sheets Per Unit</Label>
                        <Input
                            type="number"
                            {...register('sheetsPerUnit', { valueAsNumber: true })}
                            placeholder="Enter sheets per unit..."
                            className="h-8"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm">Reference ID</Label>
                        <Input 
                            {...register('referenceId')} 
                            placeholder="Enter reference ID..." 
                            className="h-8"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm">Supplier</Label>
                        <Input 
                            {...register('supplier')} 
                            placeholder="Enter supplier..." 
                            className="h-8"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <Label className="text-sm">Custom Description</Label>
                        <Input 
                            {...register('customDescription')} 
                            placeholder="Enter custom description..." 
                            className="h-8"
                        />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-2 py-1">
                        <input
                            type="checkbox"
                            {...register('isHPIndigo')}
                            className="checkbox h-4 w-4"
                        />
                        <Label className="text-sm">HP Indigo</Label>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCancel}
                        className="h-8 px-3"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 px-3"
                    >
                        Create Paper Product
                    </Button>
                </div>
            </form>
        </div>
    );
}; 