import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';
import { AddressType, ShippingMethod } from '@prisma/client';

const shippingInfoSchema = z.object({
    shippingMethod: z.nativeEnum(ShippingMethod),
    instructions: z.string().optional(),
    addressId: z.string().optional(),
    shippingCost: z.number().optional(),
    shippingDate: z.date().optional(),
    shippingNotes: z.string().optional(),
    shippingOther: z.string().optional(),
    shipToSameAsBillTo: z.boolean().optional(),
    // ShippingPickup fields
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

const WorkOrderShippingInfoForm: React.FC = () => {
    const { control, register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ShippingInfoFormData>({
        resolver: zodResolver(shippingInfoSchema),
        defaultValues: {
            shippingMethod: ShippingMethod.Courier,
        },
    });
    const { workOrder, setWorkOrder, setCurrentStep } = useContext(WorkOrderContext);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [isCreatingNewAddress, setIsCreatingNewAddress] = useState(false);
    const createShippingInfoMutation = api.shippingInfo.create.useMutation();
    const addShippingInfoToWorkOrderMutation = api.workOrders.addShippingInfo.useMutation();
    const createAddressMutation = api.address.create.useMutation();
    const { data: officeData } = api.offices.getById.useQuery(workOrder.officeId, { enabled: !!workOrder.officeId });

    const shippingMethod = watch('shippingMethod');

    const {
        register: registerAddress,
        handleSubmit: handleSubmitAddress,
        formState: { errors: addressErrors },
        reset: resetAddressForm
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
    });

    useEffect(() => {
        if (officeData && officeData.Addresses) {
            setAddresses(officeData.Addresses);
        }
    }, [officeData]);

    useEffect(() => {
        // Reset irrelevant fields when shipping method changes
        if (shippingMethod === ShippingMethod.Pickup || shippingMethod === ShippingMethod.Other) {
            setValue('addressId', undefined);
            setSelectedAddress(null);
            setIsCreatingNewAddress(false);
        } else {
            setValue('pickupDate', undefined);
            setValue('pickupTime', undefined);
        }
    }, [shippingMethod, setValue]);

    const handleShippingInfoSubmit = async (data: ShippingInfoFormData) => {
        try {
            const shippingInfoData: any = {
                shippingMethod: data.shippingMethod,
                instructions: data.instructions,
                officeId: workOrder.officeId,
                shippingCost: data.shippingCost,
                shippingDate: data.shippingDate,
                shippingNotes: data.shippingNotes,
                shippingOther: data.shippingOther,
                shipToSameAsBillTo: data.shipToSameAsBillTo,
            };

            if (data.shippingMethod === ShippingMethod.Pickup) {
                shippingInfoData.shippingPickup = {
                    pickupDate: data.pickupDate ? new Date(data.pickupDate) : undefined,
                    pickupTime: data.pickupTime,
                    contactPhone: data.pickupContactPhone,
                    notes: data.pickupNotes,
                };
            } else if (data.shippingMethod !== ShippingMethod.Other) {
                shippingInfoData.addressId = data.addressId;
            }

            const newShippingInfo = await createShippingInfoMutation.mutateAsync(shippingInfoData);

            await addShippingInfoToWorkOrderMutation.mutateAsync({
                id: workOrder.id,
                shippingInfoId: newShippingInfo.id,
            });

            setWorkOrder({
                ...workOrder,
                shippingInfoId: newShippingInfo.id,
            });

            setCurrentStep(prev => prev + 1);
        } catch (error) {
            console.error("Error creating shipping info:", error);
        }
    };

    const handleAddressSubmit = async (data: AddressFormData) => {
        try {
            const newAddress = await createAddressMutation.mutateAsync({
                ...data,
                officeId: workOrder.officeId,
            });
            setAddresses(prev => [...prev, newAddress]);
            setSelectedAddress(newAddress.id);
            setValue('addressId', newAddress.id);
            setIsCreatingNewAddress(false);
            resetAddressForm();
        } catch (error) {
            console.error("Error creating new address:", error);
        }
    };

    const needsAddress = shippingMethod !== ShippingMethod.Pickup && shippingMethod !== ShippingMethod.Other;

    return (
        <div className="space-y-6">
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

                {needsAddress && (
                    <div>
                        <label htmlFor="addressId" className="block text-sm font-medium text-gray-700">Select Address</label>
                        <select
                            {...register('addressId')}
                            className="select select-bordered w-full"
                            onChange={(e) => {
                                if (e.target.value === 'new') {
                                    setIsCreatingNewAddress(true);
                                } else {
                                    setSelectedAddress(e.target.value);
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

                <button type="submit" className="btn btn-primary">Submit and Next Step</button>
            </form>

            {needsAddress && isCreatingNewAddress && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Create New Address</h3>
                    <form onSubmit={handleSubmitAddress(handleAddressSubmit)} className="space-y-4 mt-4">
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
                        <div className="flex justify-between">
                            <button type="submit" className="btn btn-primary">Add Address</button>
                            <button type="button" onClick={() => setIsCreatingNewAddress(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default WorkOrderShippingInfoForm;