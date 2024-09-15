import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { AddressType, ShippingMethod, ShippingInfo, Address } from '@prisma/client';
import { SerializedShippingInfo, SerializedAddress } from '~/types/serializedTypes';

const shippingInfoSchema = z.object({
    shippingMethod: z.nativeEnum(ShippingMethod),
    instructions: z.string().optional(),
    addressId: z.string().optional(),
    shippingCost: z.number().optional(),
    shippingDate: z.string().optional(), // Changed to string
    shippingNotes: z.string().optional(),
    shippingOther: z.string().optional(),
    shipToSameAsBillTo: z.boolean().optional(),
    pickupDate: z.string().optional(),
    pickupTime: z.string().optional(),
    pickupContactName: z.string().optional(),
    pickupContactPhone: z.string().optional(),
    pickupNotes: z.string().optional(),
});

const addressSchema = z.object({
    line1: z.string().min(1, 'Address Line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip Code is required'),
    country: z.string().min(1, 'Country is required'),
    telephoneNumber: z.string().min(1, 'Telephone Number is required'),
    addressType: z.nativeEnum(AddressType),
});

type ShippingInfoFormData = z.infer<typeof shippingInfoSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

interface ShippingInfoEditorProps {
    orderId: string;
    currentShippingInfo: SerializedShippingInfo | null;
    officeId: string;
    onUpdate: () => void;
}

const ShippingInfoEditor: React.FC<ShippingInfoEditorProps> = ({ orderId, currentShippingInfo, officeId, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isCreatingNewAddress, setIsCreatingNewAddress] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ShippingInfoFormData>({
        resolver: zodResolver(shippingInfoSchema),
        defaultValues: {
            shippingMethod: currentShippingInfo?.shippingMethod ?? ShippingMethod.Courier,
            instructions: currentShippingInfo?.instructions ?? undefined,
            addressId: currentShippingInfo?.addressId ?? undefined,
            shippingCost: currentShippingInfo?.shippingCost ? parseFloat(currentShippingInfo.shippingCost) : undefined,
            shippingDate: currentShippingInfo?.shippingDate ?? undefined,
            shippingNotes: currentShippingInfo?.shippingNotes ?? undefined,
            shippingOther: currentShippingInfo?.shippingOther ?? undefined,
            shipToSameAsBillTo: currentShippingInfo?.shipToSameAsBillTo ?? undefined,
        },
    });

    const {
        register: registerAddress,
        handleSubmit: handleSubmitAddress,
        formState: { errors: addressErrors },
        reset: resetAddressForm
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
    });

    const { data: officeData } = api.offices.getById.useQuery(officeId, { enabled: !!officeId });
    const updateShippingInfoMutation = api.orders.updateShippingInfo.useMutation();
    const createAddressMutation = api.addresses.create.useMutation();

    const shippingMethod = watch('shippingMethod');

    useEffect(() => {
        if (officeData && officeData.Addresses) {
            setAddresses(officeData.Addresses);
        }
    }, [officeData]);

    const handleShippingInfoSubmit = async (data: ShippingInfoFormData) => {
        setIsSubmitting(true);
        try {
            await updateShippingInfoMutation.mutateAsync({
                orderId,
                shippingInfo: {
                    ...data,
                    shippingCost: data.shippingCost ?? undefined,
                    shippingDate: data.shippingDate ? new Date(data.shippingDate) : undefined,
                },
            });
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            console.error("Error updating shipping info:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddressSubmit = async (data: AddressFormData) => {
        try {
            const newAddress = await createAddressMutation.mutateAsync({
                ...data,
                officeId,
            });
            setAddresses(prev => [...prev, newAddress]);
            setValue('addressId', newAddress.id);
            setIsCreatingNewAddress(false);
            resetAddressForm();
        } catch (error) {
            console.error("Error creating new address:", error);
        }
    };

    if (!isEditing) {
        return (
            <div>
                <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
                {currentShippingInfo ? (
                    <>
                        <p>Method: {currentShippingInfo.shippingMethod}</p>
                        <p>Address: {currentShippingInfo.Address?.line1}, {currentShippingInfo.Address?.city}</p>
                        <button onClick={() => setIsEditing(true)} className="btn btn-primary mt-2">Edit Shipping Info</button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="btn btn-primary">Add Shipping Information</button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-2">Edit Shipping Information</h3>
            <form onSubmit={handleSubmit(handleShippingInfoSubmit)} className="space-y-4">
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

                {shippingMethod !== ShippingMethod.Pickup && shippingMethod !== ShippingMethod.Other && (
                    <div>
                        <label htmlFor="addressId" className="block text-sm font-medium text-gray-700">Select Address</label>
                        <select
                            {...register('addressId')}
                            className="select select-bordered w-full"
                            onChange={(e) => {
                                if (e.target.value === 'new') {
                                    setIsCreatingNewAddress(true);
                                } else {
                                    setIsCreatingNewAddress(false);
                                }
                            }}
                        >
                            <option value="">Select an address</option>
                            {addresses.map((address) => (
                                <option key={address.id} value={address.id}>
                                    {address.line1}, {address.city}, {address.state} {address.zipCode}
                                </option>
                            ))}
                            <option value="new">Create new address</option>
                        </select>
                        {errors.addressId && <p className="text-red-500">{errors.addressId.message}</p>}
                    </div>
                )}

                {shippingMethod === ShippingMethod.Pickup && (
                    <>
                        <div>
                            <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">Pickup Date</label>
                            <input type="date" {...register('pickupDate')} className="input input-bordered w-full" />
                            {errors.pickupDate && <p className="text-red-500">{errors.pickupDate.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">Pickup Time</label>
                            <input type="time" {...register('pickupTime')} className="input input-bordered w-full" />
                            {errors.pickupTime && <p className="text-red-500">{errors.pickupTime.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="pickupContactName" className="block text-sm font-medium text-gray-700">Pickup Contact Name</label>
                            <input {...register('pickupContactName')} className="input input-bordered w-full" />
                            {errors.pickupContactName && <p className="text-red-500">{errors.pickupContactName.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="pickupContactPhone" className="block text-sm font-medium text-gray-700">Pickup Contact Phone</label>
                            <input {...register('pickupContactPhone')} className="input input-bordered w-full" />
                            {errors.pickupContactPhone && <p className="text-red-500">{errors.pickupContactPhone.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="pickupNotes" className="block text-sm font-medium text-gray-700">Pickup Notes</label>
                            <textarea {...register('pickupNotes')} className="textarea textarea-bordered w-full" />
                            {errors.pickupNotes && <p className="text-red-500">{errors.pickupNotes.message}</p>}
                        </div>
                    </>
                )}

                <div>
                    <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions</label>
                    <textarea {...register('instructions')} className="textarea textarea-bordered w-full" />
                    {errors.instructions && <p className="text-red-500">{errors.instructions.message}</p>}
                </div>

                <div>
                    <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700">Shipping Cost</label>
                    <input type="number" step="0.01" {...register('shippingCost', { valueAsNumber: true })} className="input input-bordered w-full" />
                    {errors.shippingCost && <p className="text-red-500">{errors.shippingCost.message}</p>}
                </div>

                <div>
                    <label htmlFor="shippingDate" className="block text-sm font-medium text-gray-700">Shipping Date</label>
                    <input
                        type="date"
                        {...register('shippingDate')}
                        className="input input-bordered w-full"
                        defaultValue={currentShippingInfo?.shippingDate ? new Date(currentShippingInfo.shippingDate).toISOString().split('T')[0] : undefined}
                    />
                    {errors.shippingDate && <p className="text-red-500">{errors.shippingDate.message}</p>}
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <span className="loading loading-spinner"></span>
                            Updating...
                        </>
                    ) : (
                        'Update Shipping Info'
                    )}
                </button>
            </form>

            {isCreatingNewAddress && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Create New Address</h3>
                    <form onSubmit={handleSubmitAddress(handleAddressSubmit)} className="space-y-4 mt-4">
                        {/* Address form fields */}
                        <div>
                            <label htmlFor="line1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                            <input {...registerAddress('line1')} className="input input-bordered w-full" />
                            {addressErrors.line1 && <p className="text-red-500">{addressErrors.line1.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="line2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
                            <input {...registerAddress('line2')} className="input input-bordered w-full" />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input {...registerAddress('city')} className="input input-bordered w-full" />
                            {addressErrors.city && <p className="text-red-500">{addressErrors.city.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                            <input {...registerAddress('state')} className="input input-bordered w-full" />
                            {addressErrors.state && <p className="text-red-500">{addressErrors.state.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                            <input {...registerAddress('zipCode')} className="input input-bordered w-full" />
                            {addressErrors.zipCode && <p className="text-red-500">{addressErrors.zipCode.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                            <input {...registerAddress('country')} className="input input-bordered w-full" />
                            {addressErrors.country && <p className="text-red-500">{addressErrors.country.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="telephoneNumber" className="block text-sm font-medium text-gray-700">Telephone Number</label>
                            <input {...registerAddress('telephoneNumber')} className="input input-bordered w-full" />
                            {addressErrors.telephoneNumber && <p className="text-red-500">{addressErrors.telephoneNumber.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="addressType" className="block text-sm font-medium text-gray-700">Address Type</label>
                            <select {...registerAddress('addressType')} className="select select-bordered w-full">
                                {Object.values(AddressType).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {addressErrors.addressType && <p className="text-red-500">{addressErrors.addressType.message}</p>}
                        </div>
                        <button type="submit" className="btn btn-primary">Add Address</button>
                        <button type="button" onClick={() => setIsCreatingNewAddress(false)} className="btn btn-secondary ml-2">Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ShippingInfoEditor;