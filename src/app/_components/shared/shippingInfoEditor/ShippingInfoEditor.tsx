import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { AddressType, ShippingMethod, ShippingInfo, type Address } from '@prisma/client';
import { type SerializedShippingInfo, SerializedAddress } from '~/types/serializedTypes';
import { formatCurrency, formatDate } from '~/utils/formatters';
import { Truck, MapPin, DollarSign, Calendar, Notebook, Package, FileText, FilePenLine, Pencil, PlusCircle } from 'lucide-react';
import { Button } from "../../ui/button";
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { SelectField } from '~/app/_components/shared/ui/SelectField/SelectField';
import { toast } from 'react-hot-toast';

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
    trackingNumber: z.string().optional(),
}).refine((data) => {
    if (data.shippingMethod === ShippingMethod.Pickup) {
        return !!data.shippingPickup;
    }
    return true;
}, {
    message: "Pickup information is required when shipping method is Pickup",
    path: ["shippingPickup"],
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
            addressId: currentShippingInfo?.addressId ?? undefined,
            instructions: currentShippingInfo?.instructions ?? undefined,
            shippingCost: currentShippingInfo?.shippingCost ? parseFloat(currentShippingInfo.shippingCost) : undefined,
            shippingDate: currentShippingInfo?.shippingDate ?? undefined,
            shippingMethod: currentShippingInfo?.shippingMethod ?? ShippingMethod.Courier,
            shippingNotes: currentShippingInfo?.shippingNotes ?? undefined,
            shippingOther: currentShippingInfo?.shippingOther ?? undefined,
            shipToSameAsBillTo: currentShippingInfo?.shipToSameAsBillTo ?? undefined,
            trackingNumber: currentShippingInfo?.trackingNumber ?? undefined,
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

    const { data: officeData } = api.offices.getById.useQuery(officeId, { enabled: !!officeId });
    const updateShippingInfoMutation = api.orders.updateShippingInfo.useMutation({
        onSuccess: () => {
            console.log('Shipping info updated successfully');
            setIsEditing(false);
            onUpdate();
        },
        onError: (error) => {
            console.error('Error updating shipping info:', error);
            toast.error('Failed to update shipping info');
        }
    });
    const createAddressMutation = api.addresses.create.useMutation();

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
    }, [isEditing, currentShippingInfo, setValue]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log('Form validation errors:', errors);
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
        setIsSubmitting(true);
        try {
            console.log('Submitting shipping info:', data);
            const shippingData = {
                ...data,
                shippingCost: data.shippingCost ?? undefined,
                shippingDate: data.shippingDate ? new Date(data.shippingDate) : undefined,
                shippingPickup: data.shippingMethod === ShippingMethod.Pickup ? {
                    contactName: data.shippingPickup?.contactName ?? '',
                    contactPhone: data.shippingPickup?.contactPhone ?? '',
                    pickupDate: data.shippingPickup?.pickupDate ? new Date(data.shippingPickup.pickupDate) : new Date(),
                    pickupTime: data.shippingPickup?.pickupTime ?? '',
                    notes: data.shippingPickup?.notes,
                } : undefined
            };

            await toast.promise(
                updateShippingInfoMutation.mutateAsync({
                    orderId,
                    shippingInfo: shippingData,
                }),
                {
                    loading: 'Updating shipping info...',
                    success: 'Shipping info updated successfully',
                    error: 'Failed to update shipping info'
                }
            );
            
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            console.error("Error updating shipping info:", error);
            toast.error('Failed to update shipping info');
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

    const onSubmit = async (data: ShippingInfoFormData) => {
        console.log('Form submitted with data:', data);
        await handleShippingInfoSubmit(data);
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
                                    <div className="font-medium">{currentShippingInfo.Address?.line1}, {currentShippingInfo.Address?.city}, {currentShippingInfo.Address?.state} {currentShippingInfo.Address?.zipCode}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Cost</div>
                                    <div className="font-medium">{currentShippingInfo.shippingCost ? formatCurrency(currentShippingInfo.shippingCost) : 'N/A'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Date</div>
                                    <div className="font-medium">{currentShippingInfo.shippingDate ? formatDate(currentShippingInfo.shippingDate) : 'N/A'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Instructions</div>
                                    <div className="font-medium">{currentShippingInfo.instructions}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Notebook className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Notes</div>
                                    <div className="font-medium">{currentShippingInfo.shippingNotes}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Other</div>
                                    <div className="font-medium">{currentShippingInfo.shippingOther}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Tracking Number</div>
                                    <div className="font-medium">{currentShippingInfo.trackingNumber}</div>
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
                onSubmit={handleSubmit(onSubmit)} 
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
                        <SelectField
                            options={[
                                ...addresses.map(address => ({ value: address.id, label: `${address.line1}, ${address.city}, ${address.state}` })),
                                { value: 'new', label: 'Create New Address' },
                            ]}
                            value={watch('addressId') || ''}
                            onValueChange={(value) => {
                                if (value === 'new') {
                                    setIsCreatingNewAddress(true);
                                    setValue('addressId', ''); // Clear the address ID when creating new
                                } else {
                                    setValue('addressId', value);
                                }
                            }}
                            placeholder="Select Address"
                        />
                        {errors.addressId && <p className="text-red-500">{errors.addressId.message}</p>}
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

                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="trackingNumber">Tracking Number</Label>
                    <Input {...register('trackingNumber')} className="input input-bordered w-full" />
                    {errors.trackingNumber && <p className="text-red-500">{errors.trackingNumber.message}</p>}
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

                <div className="flex justify-end gap-2">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="default"
                        onClick={() => console.log('Submit button clicked')}
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

            {isCreatingNewAddress && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Create New Address</h3>
                    <form onSubmit={handleSubmitAddress(handleAddressSubmit)} className="space-y-4 mt-4">
                        {/* Address form fields */}
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="line1">Address Line 1</Label>
                            <Input {...registerAddress('line1')} className="input input-bordered w-full" />
                            {addressErrors.line1 && <p className="text-red-500">{addressErrors.line1.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="line2">Address Line 2</Label>
                            <Input {...registerAddress('line2')} className="input input-bordered w-full" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="city">City</Label>
                            <Input {...registerAddress('city')} className="input input-bordered w-full" />
                            {addressErrors.city && <p className="text-red-500">{addressErrors.city.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="state">State</Label>
                            <Input {...registerAddress('state')} className="input input-bordered w-full" />
                            {addressErrors.state && <p className="text-red-500">{addressErrors.state.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="zipCode">Zip Code</Label>
                            <Input {...registerAddress('zipCode')} className="input input-bordered w-full" />
                            {addressErrors.zipCode && <p className="text-red-500">{addressErrors.zipCode.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="country">Country</Label>
                            <Input {...registerAddress('country')} className="input input-bordered w-full" />
                            {addressErrors.country && <p className="text-red-500">{addressErrors.country.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="telephoneNumber">Telephone Number</Label>
                            <Input {...registerAddress('telephoneNumber')} className="input input-bordered w-full" />
                            {addressErrors.telephoneNumber && <p className="text-red-500">{addressErrors.telephoneNumber.message}</p>}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                            <Label htmlFor="addressType">Address Type</Label>
                            <SelectField
                                options={Object.values(AddressType).map(type => ({ value: type, label: type }))}
                                value={watchAddress('addressType') || AddressType.Other}
                                onValueChange={(value) => setValueAddress('addressType', value as AddressType)}
                                placeholder="Select Address Type"
                            />
                            {addressErrors.addressType && <p className="text-red-500">{addressErrors.addressType.message}</p>}
                        </div>
                        <Button
                            variant="default"
                            type="submit"
                        >
                            Add Address
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setIsCreatingNewAddress(false)}
                        >
                            Cancel
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ShippingInfoEditor;