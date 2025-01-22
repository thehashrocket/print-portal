import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { ShippingMethod, type Address } from '@prisma/client';
import { type SerializedShippingInfo } from '~/types/serializedTypes';
import { formatCurrency, formatDate, formatTime } from '~/utils/formatters';
import { Truck, MapPin, DollarSign, Calendar, Notebook, Package, FileText, FilePenLine, PlusCircle, X } from 'lucide-react';
import { Button } from "../../ui/button";
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { SelectField } from '~/app/_components/shared/ui/SelectField/SelectField';
import { toast } from 'react-hot-toast';
import { CreateAddressModal } from '~/app/_components/shared/addresses/createAddressModal';

const shippingInfoSchema = z.object({
    addressId: z.string().optional(),
    instructions: z.string().optional(),
    shippingPickup: z.object({
        contactName: z.string().min(1, 'Contact name is required'),
        contactPhone: z.string().min(1, 'Contact phone is required'),
        pickupDate: z.string().min(1, 'Pickup date is required'),
        pickupTime: z.string().min(1, 'Pickup time is required'),
        notes: z.string().optional(),
    }).optional().nullable(),
    shippingCost: z.number().optional(),
    shippingDate: z.string().optional(),
    shippingMethod: z.nativeEnum(ShippingMethod),
    shippingNotes: z.string().optional(),
    shippingOther: z.string().optional(),
    shipToSameAsBillTo: z.boolean().optional(),
    trackingNumbers: z.array(z.string()).default([]),
}).refine((data) => {
    if (data.shippingMethod === ShippingMethod.Pickup) {
        return !!data.shippingPickup;
    }
    return true;
}, {
    message: "Pickup information is required when shipping method is Pickup",
    path: ["shippingPickup"],
});

type ShippingInfoFormData = z.infer<typeof shippingInfoSchema>;

interface ShippingInfoEditorProps {
    orderId?: string;
    orderItemId?: string;
    workOrderItemId?: string;
    currentShippingInfo: SerializedShippingInfo | null;
    officeId: string;
    onUpdate: () => void;
}

const ShippingInfoEditor: React.FC<ShippingInfoEditorProps> = ({
    orderId,
    orderItemId,
    workOrderItemId,
    currentShippingInfo,
    officeId,
    onUpdate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreateAddressModalOpen, setIsCreateAddressModalOpen] = useState(false);
    const [isAddressBeingCreated, setIsAddressBeingCreated] = useState(false);

    const { control, register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ShippingInfoFormData>({
        resolver: zodResolver(shippingInfoSchema),
        defaultValues: {
            addressId: currentShippingInfo?.addressId ?? undefined,
            instructions: currentShippingInfo?.instructions ?? undefined,
            shippingCost: currentShippingInfo?.shippingCost ? parseFloat(currentShippingInfo.shippingCost) : undefined,
            shippingDate: currentShippingInfo?.shippingDate ?? undefined,
            shippingMethod: currentShippingInfo?.shippingMethod ?? ShippingMethod.Courier,
            shippingNotes: currentShippingInfo?.shippingNotes ?? undefined,
            shippingOther: currentShippingInfo?.shippingOther ?? undefined,
            shipToSameAsBillTo: currentShippingInfo?.shipToSameAsBillTo ?? undefined,
            trackingNumbers: currentShippingInfo?.trackingNumber || [],
            shippingPickup: currentShippingInfo?.ShippingPickup ? {
                contactName: currentShippingInfo.ShippingPickup.contactName,
                contactPhone: currentShippingInfo.ShippingPickup.contactPhone,
                pickupDate: new Date(currentShippingInfo.ShippingPickup.pickupDate).toISOString().split('T')[0],
                pickupTime: currentShippingInfo.ShippingPickup.pickupTime,
                notes: currentShippingInfo.ShippingPickup.notes ?? undefined,
            } : {
                contactName: '',
                contactPhone: '',
                pickupDate: '',
                pickupTime: '',
                notes: '',
            },
        },
    });

    const { data: officeData } = api.offices.getById.useQuery(officeId, { enabled: !!officeId });

    // Use the appropriate mutation based on the type of item
    const updateOrderShippingInfoMutation = api.orders.updateShippingInfo.useMutation({
        onSuccess: () => {
            console.log('Order shipping info updated successfully');
            onUpdate();
        },
        onError: (error) => {
            console.error('Error updating order shipping info:', error);
            toast.error('Failed to update shipping info');
        }
    });

    const updateOrderItemShippingInfoMutation = api.orderItems.updateShippingInfo.useMutation({
        onSuccess: () => {
            console.log('Order item shipping info updated successfully');
            onUpdate();
        },
        onError: (error) => {
            console.error('Error updating order item shipping info:', error);
            toast.error('Failed to update shipping info');
        }
    });

    const updateWorkOrderItemShippingInfoMutation = api.workOrderItems.updateShippingInfo.useMutation({
        onSuccess: () => {
            console.log('Work order item shipping info updated successfully');
            onUpdate();
        },
        onError: (error) => {
            console.error('Error updating work order item shipping info:', error);
            toast.error('Failed to update shipping info');
        }
    });

    const shippingMethod = watch('shippingMethod');

    useEffect(() => {
        if (officeData && officeData.Addresses) {
            setAddresses(officeData.Addresses);
        }
    }, [officeData]);

    useEffect(() => {
        if (isEditing && currentShippingInfo?.shippingDate) {
            setValue('shippingDate', new Date(currentShippingInfo.shippingDate).toISOString().split('T')[0]);
        }
    }, [isEditing, currentShippingInfo?.shippingDate, setValue]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
        }
    }, [errors]);

    useEffect(() => {
        if (shippingMethod === ShippingMethod.Pickup) {
            setValue('shippingPickup', {
                contactName: watch('shippingPickup.contactName') ?? '',
                contactPhone: watch('shippingPickup.contactPhone') ?? '',
                pickupDate: watch('shippingPickup.pickupDate') ?? '',
                pickupTime: watch('shippingPickup.pickupTime') ?? '',
                notes: watch('shippingPickup.notes') ?? '',
            });
        } else {
            setValue('shippingPickup', undefined);
        }
    }, [shippingMethod, setValue, watch]);

    const handleShippingInfoSubmit = async (data: ShippingInfoFormData) => {
        if (isAddressBeingCreated) {
            setIsAddressBeingCreated(false);
            return;
        }

        setIsSubmitting(true);
        try {
            console.log('Submitting shipping info:', data);
            const shippingData = {
                ...data,
                shippingCost: data.shippingCost ?? undefined,
                shippingDate: data.shippingDate ? new Date(data.shippingDate + 'T12:00:00') : undefined,
                shippingPickup: data.shippingMethod === ShippingMethod.Pickup ? {
                    contactName: data.shippingPickup?.contactName ?? '',
                    contactPhone: data.shippingPickup?.contactPhone ?? '',
                    pickupDate: data.shippingPickup?.pickupDate ? new Date(data.shippingPickup.pickupDate + 'T12:00:00') : new Date(),
                    pickupTime: data.shippingPickup?.pickupTime ?? '',
                    notes: data.shippingPickup?.notes,
                } : undefined
            };

            if (orderId) {
                await toast.promise(
                    updateOrderShippingInfoMutation.mutateAsync({
                        orderId,
                        shippingInfo: shippingData,
                    }),
                    {
                        loading: 'Updating shipping info...',
                        success: 'Shipping info updated successfully',
                        error: 'Failed to update shipping info'
                    }
                );
            } else if (orderItemId) {
                await toast.promise(
                    updateOrderItemShippingInfoMutation.mutateAsync({
                        orderItemId,
                        shippingInfo: shippingData,
                    }),
                    {
                        loading: 'Updating shipping info...',
                        success: 'Shipping info updated successfully',
                        error: 'Failed to update shipping info'
                    }
                );
            } else if (workOrderItemId) {
                await toast.promise(
                    updateWorkOrderItemShippingInfoMutation.mutateAsync({
                        workOrderItemId,
                        shippingInfo: shippingData,
                    }),
                    {
                        loading: 'Updating shipping info...',
                        success: 'Shipping info updated successfully',
                        error: 'Failed to update shipping info'
                    }
                );
            }

            if (!isAddressBeingCreated) {
                setIsEditing(false);
            }

        } catch (error) {
            console.error("Error updating shipping info:", error);
            toast.error('Failed to update shipping info');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        reset(); // This resets the form to its default values
    };

    const renderPickupForm = () => (
        <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900">Pickup Information</h4>

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="pickupDate">Pickup Date</Label>
                <Controller
                    name="shippingPickup.pickupDate"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <Input
                            type="date"
                            {...field}
                            value={field.value || ''}
                            className="input input-bordered w-full"
                        />
                    )}
                />
                {errors.shippingPickup?.pickupDate &&
                    <p className="text-red-500">Pickup date is required</p>
                }
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="pickupTime">Pickup Time</Label>
                <Controller
                    name="shippingPickup.pickupTime"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <Input
                            type="time"
                            {...field}
                            value={field.value || ''}
                            className="input input-bordered w-full"
                        />
                    )}
                />
                {errors.shippingPickup?.pickupTime &&
                    <p className="text-red-500">Pickup time is required</p>
                }
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="contactName">Contact Name</Label>
                <Controller
                    name="shippingPickup.contactName"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <Input
                            {...field}
                            value={field.value || ''}
                            className="input input-bordered w-full"
                        />
                    )}
                />
                {errors.shippingPickup?.contactName &&
                    <p className="text-red-500">Contact name is required</p>
                }
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Controller
                    name="shippingPickup.contactPhone"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <Input
                            {...field}
                            value={field.value || ''}
                            className="input input-bordered w-full"
                        />
                    )}
                />
                {errors.shippingPickup?.contactPhone &&
                    <p className="text-red-500">Contact phone is required</p>
                }
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="notes">Pickup Notes</Label>
                <Controller
                    name="shippingPickup.notes"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <textarea
                            {...field}
                            value={field.value || ''}
                            className="textarea textarea-bordered w-full"
                        />
                    )}
                />
            </div>
        </div>
    );

    // Add function to handle adding new tracking number fields
    const addTrackingNumber = () => {
        const currentTrackingNumbers = watch('trackingNumbers') || [];
        setValue('trackingNumbers', [...currentTrackingNumbers, '']);
    };

    // Add function to handle removing tracking number fields
    const removeTrackingNumber = (index: number) => {
        const currentTrackingNumbers = watch('trackingNumbers') || [];
        setValue('trackingNumbers', currentTrackingNumbers.filter((_, i) => i !== index));
    };

    if (!isEditing) {
        return (
            <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
                {currentShippingInfo ? (
                    <>
                        <div className="grid gap-4">
                            <div className="flex items-center gap-3">
                                <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Method</div>
                                    <div className="font-medium">{currentShippingInfo.shippingMethod}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Address</div>
                                    <div className="font-medium">
                                        {currentShippingInfo.Address?.name && `${currentShippingInfo.Address.name}, `}
                                        {currentShippingInfo.Address?.line1}
                                        {currentShippingInfo.Address?.line2 && `, ${currentShippingInfo.Address.line2}`}
                                        {currentShippingInfo.Address?.line3 && `, ${currentShippingInfo.Address.line3}`}
                                        {currentShippingInfo.Address?.line4 && `, ${currentShippingInfo.Address.line4}`}
                                        {currentShippingInfo.Address?.city && `, ${currentShippingInfo.Address.city}`}
                                        {currentShippingInfo.Address?.state && `, ${currentShippingInfo.Address.state}`}
                                        {currentShippingInfo.Address?.zipCode && ` ${currentShippingInfo.Address.zipCode}`}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Cost</div>
                                    <div className="font-medium">{currentShippingInfo.shippingCost ? formatCurrency(currentShippingInfo.shippingCost) : 'N/A'}</div>
                                </div>
                            </div>

                            {currentShippingInfo.ShippingPickup && (
                                <>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-500">Pickup Date</div>
                                            <div className="font-medium">{currentShippingInfo.ShippingPickup.pickupDate ? formatDate(currentShippingInfo.ShippingPickup.pickupDate) : 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-500">Pickup Time</div>
                                            <div className="font-medium">{currentShippingInfo.ShippingPickup.pickupTime ? formatTime(currentShippingInfo.ShippingPickup.pickupTime) : 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Notebook className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-500">Notes</div>
                                            <div className="font-medium">{currentShippingInfo.ShippingPickup.notes}</div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {!currentShippingInfo.ShippingPickup && (
                                <>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-500">Shipping Date</div>
                                            <div className="font-medium">{currentShippingInfo.shippingDate ? formatDate(currentShippingInfo.shippingDate) : 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-500">Tracking Numbers</div>
                                            <div className="font-medium">
                                                {currentShippingInfo.trackingNumber && currentShippingInfo.trackingNumber.length > 0 
                                                    ? currentShippingInfo.trackingNumber.map((number: string, index: number) => (
                                                        <div key={index}>{number}</div>
                                                    ))
                                                    : 'N/A'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Instructions</div>
                                    <div className="font-medium">{currentShippingInfo.instructions}</div>
                                </div>
                            </div>

                            

                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Other</div>
                                    <div className="font-medium">{currentShippingInfo.shippingOther}</div>
                                </div>
                            </div>


                        </div>

                        <Button
                            variant="default"
                            onClick={() => setIsEditing(true)}
                        >
                            <FilePenLine className="w-4 h-4 mr-2" />
                            Edit Shipping Info
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="default"
                        onClick={() => setIsEditing(true)}
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Shipping Information
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-2">Edit Shipping Information</h3>
            <form
                onSubmit={handleSubmit(handleShippingInfoSubmit)}
                className="space-y-4"
            >
                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
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

                {shippingMethod !== ShippingMethod.Pickup && shippingMethod !== ShippingMethod.Other && (
                    <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                        <Label htmlFor="addressId">Select Address</Label>
                        <div className="flex gap-2 items-start">
                            <SelectField
                                options={addresses.map(address => ({
                                    value: address.id,
                                    label: `${address.name ? address.name : ''}, ${address.line1}, ${address.city}, ${address.state}`
                                }))}
                                value={watch('addressId') || ''}
                                onValueChange={(value) => {
                                    setValue('addressId', value);
                                }}
                                placeholder="Select Address"
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
                            officeId={officeId}
                            onAddressCreated={(newAddress) => {
                                setIsAddressBeingCreated(true);
                                setAddresses(prev => [...prev, newAddress]);
                                setValue('addressId', newAddress.id, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: true,
                                });
                                setIsCreateAddressModalOpen(false);
                            }}
                        />
                    </div>
                )}

                {shippingMethod === ShippingMethod.Pickup && renderPickupForm()}

                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="instructions">Instructions</Label>
                    <textarea {...register('instructions')} className="textarea textarea-bordered w-full" />
                    {errors.instructions && <p className="text-red-500">{errors.instructions.message}</p>}
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="shippingCost">Shipping Cost</Label>
                    <Input type="number" step="0.01" {...register('shippingCost', { valueAsNumber: true })} className="input input-bordered w-full" />
                    {errors.shippingCost && <p className="text-red-500">{errors.shippingCost.message}</p>}
                </div>

                {shippingMethod !== ShippingMethod.Pickup && (
                    <>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label>Tracking Numbers</Label>
                            <div className="space-y-2">
                                {watch('trackingNumbers')?.map((_, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            {...register(`trackingNumbers.${index}`)}
                                            placeholder="Enter tracking number"
                                            className="input input-bordered w-full"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTrackingNumber(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addTrackingNumber}
                                    className="w-full"
                                >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Tracking Number
                                </Button>
                            </div>
                        </div>

                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="shippingDate">Shipping Date</Label>
                            <Input
                                id="shippingDate"
                                type="date"
                                {...register('shippingDate')}
                                className="input input-bordered w-full"
                            />
                            {errors.shippingDate && <p className="text-red-500">{errors.shippingDate.message}</p>}
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-2">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="default"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Shipping Info'}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ShippingInfoEditor;