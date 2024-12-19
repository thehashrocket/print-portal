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
import { PlusCircle } from "lucide-react";
import { CreateAddressModal } from '~/app/_components/shared/addresses/createAddressModal';

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
    line3: z.string().optional(),
    line4: z.string().optional(),
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
    const [isCreateAddressModalOpen, setIsCreateAddressModalOpen] = useState(false);

    const shippingMethod = watch('shippingMethod');

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
                        <div className="flex gap-2 items-start">
                            <SelectField
                                options={addresses.map((address) => ({ 
                                    value: address.id, 
                                    label: `${address.line1}, ${address.city}, ${address.state} ${address.zipCode}` 
                                }))}
                                value={watch('addressId') || ''}
                                onValueChange={(value) => {
                                    setSelectedAddress(value);
                                    setValue('addressId', value);
                                }}
                                placeholder="Select an address..."
                                required={false}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-[#006739] hover:text-[#005730]"
                                onClick={() => setIsCreateAddressModalOpen(true)}
                            >
                                <PlusCircle className="h-4 w-4" />
                                Create Address
                            </Button>
                        </div>
                        {errors.addressId && <p className="text-red-500">{errors.addressId.message}</p>}
                        <CreateAddressModal
                            isOpen={isCreateAddressModalOpen}
                            onClose={() => setIsCreateAddressModalOpen(false)}
                            officeId={workOrder.officeId}
                            onAddressCreated={(newAddress) => {
                                setAddresses(prev => [...prev, newAddress]);
                                setSelectedAddress(newAddress.id);
                                setValue('addressId', newAddress.id);
                            }}
                        />
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
        </div>
    );
};

export default WorkOrderShippingInfoForm;