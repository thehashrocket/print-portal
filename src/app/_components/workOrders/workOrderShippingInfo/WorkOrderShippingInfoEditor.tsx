import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { ShippingMethod, type Address } from '@prisma/client';
import { type SerializedShippingInfo } from '~/types/serializedTypes';
import { formatCurrency, formatDate } from '~/utils/formatters';
import { FilePenLine, Truck, MapPin, DollarSign, Calendar, Notebook, Package, FileText } from 'lucide-react';
import { Button } from "../../ui/button";
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { SelectField } from '~/app/_components/shared/ui/SelectField/SelectField';
import { toast } from 'react-hot-toast';
import { CreateAddressModal } from '~/app/_components/shared/addresses/createAddressModal';


const InfoCard = ({ title, content }: { title: string; content: React.ReactNode }) => (
    <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
        <div className="bg-gray-50 p-4 rounded-lg">{content}</div>
    </section>
);


const shippingInfoSchema = z.object({
    addressId: z.string().optional(),
    instructions: z.string().optional(),
    shippingCost: z.number().optional(),
    shippingDate: z.string().optional(),
    shippingMethod: z.nativeEnum(ShippingMethod),
    shippingNotes: z.string().optional(),
    shippingOther: z.string().optional(),
    shipToSameAsBillTo: z.boolean().optional(),
    trackingNumber: z.string().optional(),
});

type ShippingInfoFormData = z.infer<typeof shippingInfoSchema>;

interface WorkOrderShippingInfoEditorProps {
    workOrderId: string;
    currentShippingInfo: SerializedShippingInfo | null;
    officeId: string;
    companyName: string;
    onUpdate: () => void;
}

export const WorkOrderShippingInfoEditor: React.FC<WorkOrderShippingInfoEditorProps> = ({
    workOrderId,
    currentShippingInfo,
    officeId,
    companyName,
    onUpdate,
}) => {
    console.log('WorkOrderShippingInfoEditor props:', {
        workOrderId,
        currentShippingInfo,
        officeId,
        companyName
    });

    const [isEditing, setIsEditing] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isCreateAddressModalOpen, setIsCreateAddressModalOpen] = useState(false);
    const [isAddressBeingCreated, setIsAddressBeingCreated] = useState(false);
    const utils = api.useUtils();

    const { data: officeData } = api.offices.getById.useQuery(officeId, { enabled: !!officeId });

    const updateShippingInfoMutation = api.workOrders.updateShippingInfo.useMutation({
        onSuccess: () => {
            utils.workOrders.getByID.invalidate(workOrderId);
            toast.success('Shipping info updated successfully');
            setIsEditing(false);
            onUpdate();
        },
        onError: (error) => {
            console.error('Error updating shipping info:', error);
            toast.error('Failed to update shipping info');
        }
    });

    const { control, register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ShippingInfoFormData>({
        resolver: zodResolver(shippingInfoSchema),
        defaultValues: {
            addressId: currentShippingInfo?.addressId ?? undefined,
            instructions: currentShippingInfo?.instructions ?? undefined,
            shippingCost: currentShippingInfo?.shippingCost ? parseFloat(currentShippingInfo.shippingCost.toString()) : undefined,
            shippingDate: currentShippingInfo?.shippingDate ?? undefined,
            shippingMethod: currentShippingInfo?.shippingMethod ?? ShippingMethod.Courier,
            shippingNotes: currentShippingInfo?.shippingNotes ?? undefined,
            shippingOther: currentShippingInfo?.shippingOther ?? undefined,
            shipToSameAsBillTo: currentShippingInfo?.shipToSameAsBillTo ?? undefined,
            trackingNumber: currentShippingInfo?.trackingNumber ?? undefined,
        },
    });

    useEffect(() => {
        if (officeData?.Addresses) {
            setAddresses(officeData.Addresses);
        }
    }, [officeData]);

    const handleShippingInfoSubmit = async (data: ShippingInfoFormData) => {
        if (isAddressBeingCreated) {
            setIsAddressBeingCreated(false);
            return;
        }

        try {
            const shippingData = {
                ...data,
                shippingCost: data.shippingCost ?? undefined,
                shippingDate: data.shippingDate ? new Date(data.shippingDate) : undefined,
            };

            await updateShippingInfoMutation.mutateAsync({
                workOrderId,
                shippingInfo: shippingData,
            });
        } catch (error) {
            console.error("Error updating shipping info:", error);
        }
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
                                    <div className="font-medium">{currentShippingInfo.instructions || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Notebook className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Notes</div>
                                    <div className="font-medium">{currentShippingInfo.shippingNotes || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <div className="text-sm text-gray-500">Tracking Number</div>
                                    <div className="font-medium">{currentShippingInfo.trackingNumber || 'N/A'}</div>
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
                        <FilePenLine className="w-4 h-4 mr-2" />
                        Add Shipping Information
                    </Button>
                )}
            </div>
        );
    }

    console.log('currentShippingInfo 2:', currentShippingInfo);
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

                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="addressId">Select Address</Label>
                    <div className="flex gap-2 items-start">
                        <SelectField
                            options={addresses.map(address => ({
                                value: address.id,
                                label: `${address.line1}, ${address.city}, ${address.state}`
                            }))}
                            value={watch('addressId') || ''}
                            onValueChange={(value) => setValue('addressId', value)}
                            placeholder="Select Address"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-[#006739] hover:text-[#005730]"
                            onClick={() => setIsCreateAddressModalOpen(true)}
                        >
                            <FilePenLine className="h-4 w-4" />
                            Create Address
                        </Button>
                    </div>
                    {errors.addressId && <p className="text-red-500">{errors.addressId.message}</p>}
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="instructions">Instructions</Label>
                    <textarea {...register('instructions')} className="textarea textarea-bordered w-full" />
                    {errors.instructions && <p className="text-red-500">{errors.instructions.message}</p>}
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="shippingCost">Shipping Cost</Label>
                    <Input 
                        type="number" 
                        step="0.01" 
                        {...register('shippingCost', { valueAsNumber: true })} 
                        className="input input-bordered w-full" 
                    />
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
                        variant="default"
                    >
                        Save Shipping Info
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            setIsEditing(false);
                            reset();
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </form>

            <CreateAddressModal
                isOpen={isCreateAddressModalOpen}
                onClose={() => setIsCreateAddressModalOpen(false)}
                officeId={officeId}
                onAddressCreated={(newAddress) => {
                    setIsAddressBeingCreated(true);
                    setAddresses(prev => [...prev, newAddress]);
                    setValue('addressId', newAddress.id);
                    setIsCreateAddressModalOpen(false);
                }}
            />
        </div>
    );
}; 