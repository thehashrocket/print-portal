import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AddressType } from '@prisma/client';
import { api } from '~/trpc/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/app/_components/ui/dialog";
import { Button } from '~/app/_components/ui/button';
import { Input } from '~/app/_components/ui/input';
import { Label } from '~/app/_components/ui/label';
import { SelectField } from '../../shared/ui/SelectField/SelectField';

const addressSchema = z.object({
    line1: z.string().min(1, 'Address Line 1 is required'),
    line2: z.string().optional(),
    line3: z.string().optional(),
    line4: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip Code is required'),
    country: z.string().min(1, 'Country is required'),
    telephoneNumber: z.string().min(1, 'Telephone Number is required'),
    addressType: z.nativeEnum(AddressType),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface CreateAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    officeId: string;
    onAddressCreated: (newAddress: any) => void;
}

export const CreateAddressModal: React.FC<CreateAddressModalProps> = ({
    isOpen,
    onClose,
    officeId,
    onAddressCreated,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
    });

    const createAddressMutation = api.addresses.create.useMutation();

    const onSubmit = async (data: AddressFormData) => {
        try {
            const newAddress = await createAddressMutation.mutateAsync({
                ...data,
                officeId,
            });
            onAddressCreated(newAddress);
            reset();
            onClose();
        } catch (error) {
            console.error("Error creating address:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Address</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="line1" className='flex gap-1'>
                            Address Line 1
                            <span className='text-red-500'>*</span>
                        </Label>
                        <Input {...register('line1')} />
                        {errors.line1 && <p className="text-sm text-red-500">{errors.line1.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="line2">Address Line 2</Label>
                        <Input {...register('line2')} />
                    </div>

                    <div>
                        <Label htmlFor="line3">Address Line 3</Label>
                        <Input {...register('line3')} />
                    </div>

                    <div>
                        <Label htmlFor="line4">Address Line 4</Label>
                        <Input {...register('line4')} />
                    </div>

                    <div>
                        <Label htmlFor="city" className='flex gap-1'>
                            City
                            <span className='text-red-500'>*</span>
                        </Label>
                        <Input {...register('city')} />
                        {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="state" className='flex gap-1'>
                            State
                            <span className='text-red-500'>*</span>
                        </Label>
                        <Input {...register('state')} />
                        {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="zipCode" className='flex gap-1'>
                            Zip Code
                            <span className='text-red-500'>*</span>
                        </Label>
                        <Input {...register('zipCode')} />
                        {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="country" className='flex gap-1'>
                            Country
                            <span className='text-red-500'>*</span>
                        </Label>
                        <Input {...register('country')} />
                        {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="telephoneNumber" className='flex gap-1'>
                            Telephone Number
                            <span className='text-red-500'>*</span>
                        </Label>
                        <Input {...register('telephoneNumber')} />
                        {errors.telephoneNumber && <p className="text-sm text-red-500">{errors.telephoneNumber.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="addressType" className='flex gap-1'>
                            Address Type
                            <span className='text-red-500'>*</span>
                        </Label>
                        <SelectField
                            options={Object.values(AddressType).map(type => ({
                                value: type,
                                label: type
                            }))}
                            value={watch('addressType')}
                            onValueChange={(value) => setValue('addressType', value as AddressType)}
                            placeholder="Select address type..."
                        />
                        {errors.addressType && <p className="text-sm text-red-500">{errors.addressType.message}</p>}
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Create Address
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 