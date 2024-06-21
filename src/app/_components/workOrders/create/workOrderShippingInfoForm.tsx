// ~/app/_components/workOrders/create/WorkOrderShippingInfoForm.tsx
"use client";
import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';
import { AddressType, ShippingMethod } from '@prisma/client';

const shippingInfoSchema = z.object({
    shippingMethod: z.nativeEnum(ShippingMethod),
    instructions: z.string().optional().nullable().default(null),
    shippingCost: z.number().optional().nullable().default(null),
    addressId: z.string().optional(),
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
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ShippingInfoFormData>({
        resolver: zodResolver(shippingInfoSchema),
    });
    const { workOrder, setWorkOrder, setCurrentStep } = useContext(WorkOrderContext);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const createShippingInfoMutation = api.shippingInfo.create.useMutation();
    const addShippingInfoToWorkOrderMutation = api.workOrders.addShippingInfo.useMutation();
    const createAddressMutation = api.address.create.useMutation();
    const { data: officeData } = api.offices.getById.useQuery(workOrder.officeId, { enabled: !!workOrder.officeId });
    const [newAddress, setNewAddress] = useState(null);

    const {
        register: registerAddress,
        handleSubmit: handleSubmitAddress,
        formState: { errors: addressErrors },
        reset: resetAddressForm
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
    });

    useEffect(() => {
        if (officeData && officeData.Addresses) setAddresses(officeData.Addresses);
    }, [officeData, setAddresses]);

    const handleShippingInfoSubmit = async (data: ShippingInfoFormData) => {
        try {
            const newShippingInfo = await createShippingInfoMutation.mutateAsync({
                ...data,
                addressId: ((newAddress !== null) ? newAddress.id : data.addressId),
                officeId: workOrder.officeId,
            });
            const { id, ...shippingInfo } = newShippingInfo;

            const result = await addShippingInfoToWorkOrderMutation.mutateAsync({
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
            const returnedAddress = await createAddressMutation.mutateAsync({
                ...data,
                officeId: workOrder.officeId,
            });
            console.log('Created new address:', returnedAddress);
            setAddresses(prev => [...prev, returnedAddress]);
            setNewAddress(returnedAddress);
            setSelectedAddress(returnedAddress.id);
            resetAddressForm();
        } catch (error) {
            console.error("Error creating new address:", error);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit(handleShippingInfoSubmit)} className="space-y-4">
                {/* Select Address */}
                <div>
                    <label htmlFor="addressId" className="block text-sm font-medium text-gray-700">Select Address</label>
                    <select
                        id="addressId"
                        {...register('addressId')}
                        className="select select-bordered w-full"
                        value={selectedAddress || ''}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                    >
                        <option value="">Select Address</option>
                        <option value="new">Create New</option>
                        {addresses.map((address) => (
                            <option key={address.id} value={address.id}>{address.line1}, {address.city}, {address.state}, {address.zipCode}</option>
                        ))}
                    </select>
                    {errors.addressId && <p className="text-red-500">{errors.addressId.message}</p>}
                </div>

                {selectedAddress !== 'new' && (
                    <>
                        {/* Shipping Method */}
                        <div>
                            <label htmlFor="shippingMethod" className="block text-sm font-medium text-gray-700">Shipping Method</label>
                            <select id="shippingMethod" {...register('shippingMethod')} className="select select-bordered w-full">
                                {Object.values(ShippingMethod).map((method) => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                            {errors.shippingMethod && <p className="text-red-500">{errors.shippingMethod.message}</p>}
                        </div>

                        {/* Instructions */}
                        <div>
                            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions</label>
                            <input id="instructions" {...register('instructions')} className="input input-bordered w-full" />
                            {errors.instructions && <p className="text-red-500">{errors.instructions.message}</p>}
                        </div>

                        {/* Shipping Cost */}
                        <div>
                            <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700">Shipping Cost</label>
                            <input id="shippingCost" type="number" step="0.01" {...register('shippingCost', { valueAsNumber: true })} className="input input-bordered w-full" />
                            {errors.shippingCost && <p className="text-red-500">{errors.shippingCost.message}</p>}
                        </div>
                    </>
                )}

                <button type="submit" className="btn btn-primary">Submit and Next Step</button>
            </form>

            {selectedAddress === 'new' && (
                <div className="space-y-4 mt-6">
                    <h3 className="text-lg font-medium text-gray-700">New Address</h3>
                    <form onSubmit={handleSubmitAddress(handleAddressSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor="line1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                            <input id="line1" {...registerAddress('line1')} className="input input-bordered w-full" />
                            {addressErrors.line1 && <p className="text-red-500">{addressErrors.line1.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="line2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
                            <input id="line2" {...registerAddress('line2')} className="input input-bordered w-full" />
                            {addressErrors.line2 && <p className="text-red-500">{addressErrors.line2.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input id="city" {...registerAddress('city')} className="input input-bordered w-full" />
                            {addressErrors.city && <p className="text-red-500">{addressErrors.city.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                            <input id="state" {...registerAddress('state')} className="input input-bordered w-full" />
                            {addressErrors.state && <p className="text-red-500">{addressErrors.state.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                            <input id="zipCode" {...registerAddress('zipCode')} className="input input-bordered w-full" />
                            {addressErrors.zipCode && <p className="text-red-500">{addressErrors.zipCode.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                            <input id="country" {...registerAddress('country')} className="input input-bordered w-full" />
                            {addressErrors.country && <p className="text-red-500">{addressErrors.country.message}</p>}
                        </div>
                        <div>
                            <label htmlFor='telephoneNumber' className="block text-sm font-medium text-gray-700">Telephone Number</label>
                            <input id='telephoneNumber' {...registerAddress('telephoneNumber')} className="input input-bordered w-full" />
                            {addressErrors.telephoneNumber && <p className="text-red-500">{addressErrors.telephoneNumber.message}</p>}
                        </div>
                        <div>
                            <label htmlFor='addressType' className="block text-sm font-medium text-gray-700">Address Type</label>
                            <select id='addressType' {...registerAddress('addressType')} className="select select-bordered w-full">
                                {Object.values(AddressType).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {addressErrors.addressType && <p className="text-red-500">{addressErrors.addressType.message}</p>}
                        </div>
                        <button type="submit" className="btn btn-primary">Add Address</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default WorkOrderShippingInfoForm;
