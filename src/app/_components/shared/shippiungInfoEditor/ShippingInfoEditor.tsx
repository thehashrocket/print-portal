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

const shippingInfoSchema = z.object({
    addressId: z.string().optional(),
    instructions: z.string().optional(),
    pickupContactName: z.string().optional(),
    pickupContactPhone: z.string().optional(),
    pickupDate: z.string().optional(),
    pickupNotes: z.string().optional(),
    pickupTime: z.string().optional(),
    shippingCost: z.number().optional(),
    shippingDate: z.string().optional(), // Changed to string
    shippingMethod: z.nativeEnum(ShippingMethod),
    shippingNotes: z.string().optional(),
    shippingOther: z.string().optional(),
    shipToSameAsBillTo: z.boolean().optional(),
    trackingNumber: z.string().optional(),
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

    useEffect(() => {
        if (isEditing && currentShippingInfo?.shippingDate) {
            setValue('shippingDate', new Date(currentShippingInfo.shippingDate).toISOString().split('T')[0]);
        }
    }, [isEditing, currentShippingInfo, setValue]);

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

    const handleCancel = () => {
        setIsEditing(false);
        reset(); // This resets the form to its default values
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
                                    <div className="font-medium">FedEx</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Address</div>
                                    <div className="font-medium">6949 Bramble Close, Mabellefort</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Cost</div>
                                    <div className="font-medium">$68.22</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Date</div>
                                    <div className="font-medium">October 25, 2025</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Notebook className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Notes</div>
                                    <div className="font-medium">Vilicus tabgo denuncio delibero coepi.</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Other</div>
                                    <div className="font-medium">Candidus viduo consectetur convoco.</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Tracking Number</div>
                                    <div className="font-medium">asdfasdfasdfasdf</div>
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
            <form onSubmit={handleSubmit(handleShippingInfoSubmit)} className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="shippingMethod">Shipping Method</Label>
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
                    <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                        <Label htmlFor="addressId">Select Address</Label>
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
                    <input
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
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading loading-spinner"></span>
                                Updating...
                            </>
                        ) : (
                            'Update Shipping Info'
                        )}
                    </Button>
                    <Button
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
                            <select {...registerAddress('addressType')} className="select select-bordered w-full">
                                {Object.values(AddressType).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
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