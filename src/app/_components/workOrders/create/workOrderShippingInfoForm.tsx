import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';
import { AddressType, ShippingMethod } from '@prisma/client';
import { Button } from '~/app/_components/ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { SelectField } from '../../shared/ui/SelectField/SelectField';

const shippingInfoSchema = z.object({
    shippingMethod: z.nativeEnum(ShippingMethod, {
        required_error: "Please select a shipping method",
    }),
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
            // shippingMethod: ShippingMethod.Courier,
        },
    });
    const { workOrder, setWorkOrder, setCurrentStep } = useContext(WorkOrderContext);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [isCreatingNewAddress, setIsCreatingNewAddress] = useState(false);
    const createShippingInfoMutation = api.shippingInfo.create.useMutation();
    const addShippingInfoToWorkOrderMutation = api.workOrders.addShippingInfo.useMutation();
    const createAddressMutation = api.addresses.create.useMutation();
    const { data: officeData } = api.offices.getById.useQuery(workOrder.officeId, { enabled: !!workOrder.officeId });

    const shippingMethod = watch('shippingMethod');

    const {
        register: registerAddress,
        handleSubmit: handleSubmitAddress,
        formState: { errors: addressErrors },
        reset: resetAddressForm,
        watch: watchAddress,
        setValue: setValueAddress
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
        if (!data.shippingMethod) {
            alert("Please select a shipping method before proceeding.");
            return;
        }

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
                    contactName: data.pickupContactName,
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
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="shippingMethod">Shipping Method</Label>
                    <SelectField
                        options={Object.values(ShippingMethod).map((method) => ({ value: method, label: method }))}
                        value={watch('shippingMethod') || ''}
                        onValueChange={(value) => setValue('shippingMethod', value as ShippingMethod)}
                        placeholder="Select shipping method..."
                        required={true}
                    />
                    {errors.shippingMethod && <p className="text-red-500">{errors.shippingMethod.message}</p>}
                </div>

                {needsAddress && (
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="addressId">Select Address</Label>
                        <SelectField
                            options={[
                                ...addresses.map((address) => ({ 
                                    value: address.id, 
                                    label: `${address.line1}, ${address.city}, ${address.state} ${address.zipCode}` 
                                })),
                                { value: 'new', label: '+ Create new address' }
                            ]}
                            value={watch('addressId') || ''}
                            onValueChange={(value) => {
                                if (value === 'new') {
                                    setIsCreatingNewAddress(true);
                                    setValue('addressId', ''); // Clear the address ID when creating new
                                } else {
                                    setSelectedAddress(value);
                                    setValue('addressId', value);
                                    setIsCreatingNewAddress(false);
                                }
                            }}
                            placeholder="Select an address..."
                            required={false}
                        />
                        {errors.addressId && <p className="text-red-500">{errors.addressId.message}</p>}
                    </div>
                )}

                {shippingMethod === ShippingMethod.Pickup && (
                    <>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="pickupDate">Pickup Date</Label>
                            <Input type="date" {...register('pickupDate')} placeholder="Select date..." />
                            {errors.pickupDate && <p className="text-red-500">{errors.pickupDate.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="pickupTime">Pickup Time</Label>
                            <Input type="time" {...register('pickupTime')} placeholder="Select time..." />
                            {errors.pickupTime && <p className="text-red-500">{errors.pickupTime.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="pickupContactName">Pickup Contact Name</Label>
                            <Input
                                {...register('pickupContactName', { required: 'Contact Name is required' })}
                                className="input input-bordered w-full"
                            />
                            {errors.pickupContactName && <p className="text-red-500">{errors.pickupContactName.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="pickupContactPhone">Pickup Contact Phone</Label>
                            <Input
                                {...register('pickupContactPhone', { required: 'Contact Phone is required' })}
                                placeholder="Enter phone number..."
                            />
                            {errors.pickupContactPhone && <p className="text-red-500">{errors.pickupContactPhone.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="pickupNotes">Pickup Notes</Label>
                            <textarea
                                {...register('pickupNotes', { required: 'Pickup Notes are required' })}
                                className="textarea textarea-bordered w-full"
                            />
                            {errors.pickupNotes && <p className="text-red-500">{errors.pickupNotes.message}</p>}
                        </div>
                    </>
                )}

                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="instructions">Instructions</Label>
                    <textarea
                        {...register('instructions', { required: 'Instructions are required' })}
                        className="textarea textarea-bordered w-full"
                    />
                    {errors.instructions && <p className="text-red-500">{errors.instructions.message}</p>}
                </div>

                <Button
                    type="submit"
                    variant="default"
                >
                    Submit and Next Step
                </Button>
            </form>

            {needsAddress && isCreatingNewAddress && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Create New Address</h3>
                    <form onSubmit={handleSubmitAddress(handleAddressSubmit)} className="space-y-4 mt-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="line1">Address Line 1</Label>
                            <Input
                                {...registerAddress('line1', { required: 'Address Line 1 is required' })}
                                className="input input-bordered w-full"
                            />
                            {addressErrors.line1 && <p className="text-red-500">{addressErrors.line1.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="line2">Address Line 2</Label>
                            <Input
                                {...registerAddress('line2', { required: 'Address Line 2 is required' })}
                                className="input input-bordered w-full"
                            />
                            {addressErrors.line2 && <p className="text-red-500">{addressErrors.line2.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="city">City</Label>
                            <Input
                                {...registerAddress('city', { required: 'City is required' })}
                                className="input input-bordered w-full"
                            />
                            {addressErrors.city && <p className="text-red-500">{addressErrors.city.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="state">State</Label>
                            <Input
                                {...registerAddress('state', { required: 'State is required' })}
                                className="input input-bordered w-full"
                            />
                            {addressErrors.state && <p className="text-red-500">{addressErrors.state.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="zipCode">Zip Code</Label>
                            <Input
                                {...registerAddress('zipCode', { required: 'Zip Code is required' })}
                                className="input input-bordered w-full"
                            />
                            {addressErrors.zipCode && <p className="text-red-500">{addressErrors.zipCode.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                {...registerAddress('country', { required: 'Country is required' })}
                                className="input input-bordered w-full"
                            />
                            {addressErrors.country && <p className="text-red-500">{addressErrors.country.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="telephoneNumber">Telephone Number</Label>
                            <Input
                                {...registerAddress('telephoneNumber', { required: 'Telephone Number is required' })}
                                className="input input-bordered w-full"
                            />
                            {addressErrors.telephoneNumber && <p className="text-red-500">{addressErrors.telephoneNumber.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="addressType">Address Type</Label>
                            <SelectField
                                options={Object.values(AddressType).map((type) => ({ value: type, label: type }))}
                                value={watchAddress('addressType')}
                                onValueChange={(value: string) => setValueAddress('addressType', value as AddressType)}
                                placeholder="Select address type..."
                                required={true}
                            />
                            {addressErrors.addressType && <p className="text-red-500">{addressErrors.addressType.message}</p>}
                        </div>
                        <div className="flex justify-between">
                            <Button
                                type="submit"
                                variant="default"
                            >
                                Add Address
                            </Button>
                            <Button
                                onClick={() => setIsCreatingNewAddress(false)}
                                variant="secondary"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default WorkOrderShippingInfoForm;