import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShippingMethod } from '@prisma/client';
import { type SerializedAddress } from '~/types/serializedTypes';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { SelectField } from '~/app/_components/shared/ui/SelectField/SelectField';

const addressSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    line1: z.string().min(1, 'Address Line 1 is required'),
    line2: z.string().optional(),
    line3: z.string().optional(),
    line4: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip Code is required'),
    country: z.string().min(1, 'Country is required'),
});

const shippingPickupSchema = z.object({
    pickupDate: z.string().min(1, 'Pickup date is required'),
    pickupTime: z.string().min(1, 'Pickup time is required'),
    contactName: z.string().min(1, 'Contact name is required'),
    contactPhone: z.string().min(1, 'Contact phone is required'),
});

const shippingInfoSchema = z.object({
    shippingMethod: z.nativeEnum(ShippingMethod),
    instructions: z.string().optional(),
    shippingCost: z.number().optional(),
    shippingDate: z.string().optional(),
    shippingNotes: z.string().optional(),
    estimatedDelivery: z.string().optional(),
    address: addressSchema.optional(),
    shippingPickup: shippingPickupSchema.optional(),
});

type ShippingInfoFormData = z.infer<typeof shippingInfoSchema>;

interface ShippingInfoFormProps {
    onSubmit: (data: ShippingInfoFormData) => void;
    officeId: string;
    getAddressesByOfficeId: (officeId: string) => Promise<SerializedAddress[]>;
}

const ShippingInfoForm: React.FC<ShippingInfoFormProps> = ({ onSubmit, officeId, getAddressesByOfficeId }) => {
    const [selectedAddress, setSelectedAddress] = useState<string>('new');
    const [officeAddresses, setOfficeAddresses] = useState<SerializedAddress[]>([]);
    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<ShippingInfoFormData>({
        resolver: zodResolver(shippingInfoSchema),
    });

    const shippingMethod = watch('shippingMethod');

    useEffect(() => {
        const fetchAddresses = async () => {
            const addresses = await getAddressesByOfficeId(officeId);
            setOfficeAddresses(addresses);
        };
        fetchAddresses();
    }, [officeId, getAddressesByOfficeId]);

    const handleFormSubmit = (data: ShippingInfoFormData) => {
        if (selectedAddress !== 'new' && shippingMethod !== ShippingMethod.Pickup && shippingMethod !== ShippingMethod.Other) {
            const selectedAddressData = officeAddresses.find(addr => addr.id === selectedAddress);
            if (selectedAddressData) {
                data.address = {
                    name: selectedAddressData.name ?? undefined,
                    line1: selectedAddressData.line1,
                    line2: selectedAddressData.line2 || '',
                    line3: selectedAddressData.line3 ?? undefined,
                    line4: selectedAddressData.line4 ?? undefined,
                    city: selectedAddressData.city,
                    state: selectedAddressData.state,
                    zipCode: selectedAddressData.zipCode,
                    country: selectedAddressData.country,
                    id: selectedAddressData.id,
                };
            }
        }
        onSubmit(data);
    };

    const handleAddressChange = (addressId: string) => {
        setSelectedAddress(addressId);
        if (addressId !== 'new') {
            const selectedAddress = officeAddresses.find(addr => addr.id === addressId);
            if (selectedAddress) {
                setValue('address', {
                    name: selectedAddress.name ?? undefined,
                    line1: selectedAddress.line1,
                    line2: selectedAddress?.line2 ?? '',
                    line3: selectedAddress?.line3 ?? '',
                    line4: selectedAddress?.line4 ?? '',
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zipCode: selectedAddress.zipCode,
                    country: selectedAddress.country,
                    id: selectedAddress.id,
                });
            }
        } else {
            setValue('address', undefined);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="shippingMethod">Shipping Method</Label>
                <Controller
                    name="shippingMethod"
                    control={control}
                    render={({ field }) => (
                        <SelectField
                            options={Object.values(ShippingMethod).map(method => ({ value: method, label: method }))}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select Shipping Method"
                        />
                    )}
                />
                {errors.shippingMethod && <p className="text-red-500">{errors.shippingMethod.message}</p>}
            </div>

            {shippingMethod === ShippingMethod.Pickup && (
                <>
                    <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                        <Label htmlFor="pickupDate">Pickup Date</Label>
                        <Input
                            id="pickupDate"
                            type="date"
                            {...register('shippingPickup.pickupDate')}
                            className="input input-bordered w-full"
                        />
                        {errors.shippingPickup?.pickupDate && <p className="text-red-500">{errors.shippingPickup.pickupDate.message}</p>}
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                        <Label htmlFor="pickupTime">Pickup Time</Label>
                        <Input
                            id="pickupTime"
                            type="time"
                            {...register('shippingPickup.pickupTime')}
                            className="input input-bordered w-full"
                        />
                        {errors.shippingPickup?.pickupTime && <p className="text-red-500">{errors.shippingPickup.pickupTime.message}</p>}
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input
                            id="contactName"
                            {...register('shippingPickup.contactName')}
                            className="input input-bordered w-full"
                        />
                        {errors.shippingPickup?.contactName && <p className="text-red-500">{errors.shippingPickup.contactName.message}</p>}
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                            id="contactPhone"
                            {...register('shippingPickup.contactPhone')}
                            className="input input-bordered w-full"
                        />
                        {errors.shippingPickup?.contactPhone && <p className="text-red-500">{errors.shippingPickup.contactPhone.message}</p>}
                    </div>
                </>
            )}

            {shippingMethod !== ShippingMethod.Pickup && shippingMethod !== ShippingMethod.Other && (
                <>
                    <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                        <Label htmlFor="addressSelect">Select Address</Label>
                        <SelectField
                            options={[
                                { value: 'new', label: 'Create New Address' },
                                ...officeAddresses.map(address => ({ value: address.id, label: `${address.name ?? ''}, ${address.line1}, ${address.city}, ${address.state}` })),
                            ]}
                            value={selectedAddress}
                            onValueChange={handleAddressChange}
                            placeholder="Select Address"
                        />
                    </div>

                    {selectedAddress === 'new' && (
                        <>
                            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                                <Label htmlFor="name">Name</Label>
                                <Input {...register('address.name')} className="input input-bordered w-full" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                                <Label htmlFor="line1">Address Line 1</Label>
                                <Input {...register('address.line1')} className="input input-bordered w-full" />
                                {errors.address?.line1 && <p className="text-red-500">{errors.address.line1.message}</p>}
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                                <Label htmlFor="line2">Address Line 2</Label>
                                <Input {...register('address.line2')} className="input input-bordered w-full" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                                <Label htmlFor="line3">Address Line 3</Label>
                                <Input {...register('address.line3')} className="input input-bordered w-full" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                                <Label htmlFor="line4">Address Line 4</Label>
                                <Input {...register('address.line4')} className="input input-bordered w-full" />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                                <Label htmlFor="city">City</Label>
                                <Input {...register('address.city')} className="input input-bordered w-full" />
                                {errors.address?.city && <p className="text-red-500">{errors.address.city.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="state">State</Label>
                                <Input {...register('address.state')} className="input input-bordered w-full" />
                                {errors.address?.state && <p className="text-red-500">{errors.address.state.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="zipCode">Zip Code</Label>
                                <Input {...register('address.zipCode')} className="input input-bordered w-full" />
                                {errors.address?.zipCode && <p className="text-red-500">{errors.address.zipCode.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="country">Country</Label>
                                <Input {...register('address.country')} className="input input-bordered w-full" />
                                {errors.address?.country && <p className="text-red-500">{errors.address.country.message}</p>}
                            </div>
                        </>
                    )}

                    <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                        <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
                        <Input
                            id="estimatedDelivery"
                            type="date"
                            {...register('estimatedDelivery')}
                            className="input input-bordered w-full"
                        />
                        {errors.estimatedDelivery && <p className="text-red-500">{errors.estimatedDelivery.message}</p>}
                    </div>
                </>
            )}

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="instructions">Instructions</Label>
                <textarea {...register('instructions')} className="textarea textarea-bordered w-full" />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="shippingCost">Shipping Cost</Label>
                <Input type="number" step="0.01" {...register('shippingCost', { valueAsNumber: true })} className="input input-bordered w-full" />
                {errors.shippingCost && <p className="text-red-500">{errors.shippingCost.message}</p>}
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="shippingNotes">Shipping Notes</Label>
                <textarea {...register('shippingNotes')} className="textarea textarea-bordered w-full" />
            </div>

            <Button
                variant="default"
                type="submit"
            >
                Submit
            </Button>
        </form>
    );
};

export default ShippingInfoForm;