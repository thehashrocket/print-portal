import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShippingMethod, type Address } from '@prisma/client';

const addressSchema = z.object({
    id: z.string().optional(),
    line1: z.string().min(1, 'Address Line 1 is required'),
    line2: z.string().optional(),
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
    getAddressesByOfficeId: (officeId: string) => Promise<Address[]>;
}

const ShippingInfoForm: React.FC<ShippingInfoFormProps> = ({ onSubmit, officeId, getAddressesByOfficeId }) => {
    const [selectedAddress, setSelectedAddress] = useState<string>('new');
    const [officeAddresses, setOfficeAddresses] = useState<Address[]>([]);
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
                    ...selectedAddressData,
                    line2: selectedAddressData.line2 || '',
                };
            }
        }
        onSubmit(data);
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const addressId = e.target.value;
        setSelectedAddress(addressId);
        if (addressId !== 'new') {
            const selectedAddress = officeAddresses.find(addr => addr.id === addressId);
            if (selectedAddress) {
                setValue('address', {
                    line1: selectedAddress.line1,
                    line2: selectedAddress?.line2 ?? '',
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
                <label htmlFor="shippingMethod" className="block text-sm font-medium text-gray-700">Shipping Method</label>
                <Controller
                    name="shippingMethod"
                    control={control}
                    render={({ field }) => (
                        <select {...field} className="select select-bordered w-full">
                            {Object.values(ShippingMethod).map((method) => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                    )}
                />
                {errors.shippingMethod && <p className="text-red-500">{errors.shippingMethod.message}</p>}
            </div>

            {shippingMethod === ShippingMethod.Pickup && (
                <>
                    <div>
                        <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">Pickup Date</label>
                        <input type="date" {...register('shippingPickup.pickupDate')} className="input input-bordered w-full" />
                        {errors.shippingPickup?.pickupDate && <p className="text-red-500">{errors.shippingPickup.pickupDate.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">Pickup Time</label>
                        <input type="time" {...register('shippingPickup.pickupTime')} className="input input-bordered w-full" />
                        {errors.shippingPickup?.pickupTime && <p className="text-red-500">{errors.shippingPickup.pickupTime.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">Contact Name</label>
                        <input {...register('shippingPickup.contactName')} className="input input-bordered w-full" />
                        {errors.shippingPickup?.contactName && <p className="text-red-500">{errors.shippingPickup.contactName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
                        <input {...register('shippingPickup.contactPhone')} className="input input-bordered w-full" />
                        {errors.shippingPickup?.contactPhone && <p className="text-red-500">{errors.shippingPickup.contactPhone.message}</p>}
                    </div>
                </>
            )}

            {shippingMethod !== ShippingMethod.Pickup && shippingMethod !== ShippingMethod.Other && (
                <>
                    <div>
                        <label htmlFor="addressSelect" className="block text-sm font-medium text-gray-700">Select Address</label>
                        <select
                            id="addressSelect"
                            value={selectedAddress}
                            onChange={handleAddressChange}
                            className="select select-bordered w-full"
                        >
                            <option value="new">Create New Address</option>
                            {officeAddresses.map((address) => (
                                <option key={address.id} value={address.id}>
                                    {address.line1}, {address.city}, {address.state}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedAddress === 'new' && (
                        <>
                            <div>
                                <label htmlFor="line1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                <input {...register('address.line1')} className="input input-bordered w-full" />
                                {errors.address?.line1 && <p className="text-red-500">{errors.address.line1.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="line2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
                                <input {...register('address.line2')} className="input input-bordered w-full" />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <input {...register('address.city')} className="input input-bordered w-full" />
                                {errors.address?.city && <p className="text-red-500">{errors.address.city.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                                <input {...register('address.state')} className="input input-bordered w-full" />
                                {errors.address?.state && <p className="text-red-500">{errors.address.state.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                                <input {...register('address.zipCode')} className="input input-bordered w-full" />
                                {errors.address?.zipCode && <p className="text-red-500">{errors.address.zipCode.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                                <input {...register('address.country')} className="input input-bordered w-full" />
                                {errors.address?.country && <p className="text-red-500">{errors.address.country.message}</p>}
                            </div>
                        </>
                    )}

                    <div>
                        <label htmlFor="estimatedDelivery" className="block text-sm font-medium text-gray-700">Estimated Delivery Date</label>
                        <input type="date" {...register('estimatedDelivery')} className="input input-bordered w-full" />
                        {errors.estimatedDelivery && <p className="text-red-500">{errors.estimatedDelivery.message}</p>}
                    </div>
                </>
            )}

            <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions</label>
                <textarea {...register('instructions')} className="textarea textarea-bordered w-full" />
            </div>

            <div>
                <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700">Shipping Cost</label>
                <input type="number" step="0.01" {...register('shippingCost', { valueAsNumber: true })} className="input input-bordered w-full" />
                {errors.shippingCost && <p className="text-red-500">{errors.shippingCost.message}</p>}
            </div>

            <div>
                <label htmlFor="shippingNotes" className="block text-sm font-medium text-gray-700">Shipping Notes</label>
                <textarea {...register('shippingNotes')} className="textarea textarea-bordered w-full" />
            </div>

            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    );
};

export default ShippingInfoForm;