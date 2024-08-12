// ~/app/_components/shared/shippingInfo/ShippingInfoForm.tsx
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const shippingInfoSchema = z.object({
    addressLine1: z.string().min(1, 'Address Line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip Code is required'),
    country: z.string().min(1, 'Country is required'),
    instructions: z.string().optional(),
    shippingOther: z.string().optional(),
    shippingDate: z.string(),
    shippingMethod: z.enum(['Courier', 'Deliver', 'DHL', 'FedEx', 'Other', 'UPS', 'USPS']),
    shippingCost: z.number().optional(),
    shipToSameAsBillTo: z.boolean().optional(),
    attentionTo: z.string().optional(),
});

type ShippingInfoFormData = z.infer<typeof shippingInfoSchema>;

interface ShippingInfoFormProps {
    onSubmit: (data: ShippingInfoFormData) => void;
}

const ShippingInfoForm: React.FC<ShippingInfoFormProps> = ({ onSubmit }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<ShippingInfoFormData>({
        resolver: zodResolver(shippingInfoSchema),
    });

    const handleFormSubmit = (data: ShippingInfoFormData) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Form fields */}
            <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <input id="addressLine1" {...register('addressLine1')} className="input input-bordered w-full" />
                {errors.addressLine1 && <p className="text-red-500">{errors.addressLine1.message}</p>}
            </div>
            <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
                <input id="addressLine2" {...register('addressLine2')} className="input input-bordered w-full" />
            </div>
            <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input id="city" {...register('city')} className="input input-bordered w-full" />
                {errors.city && <p className="text-red-500">{errors.city.message}</p>}
            </div>
            <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                <input id="state" {...register('state')} className="input input-bordered w-full" />
                {errors.state && <p className="text-red-500">{errors.state.message}</p>}
            </div>
            <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                <input id="zipCode" {...register('zipCode')} className="input input-bordered w-full" />
                {errors.zipCode && <p className="text-red-500">{errors.zipCode.message}</p>}
            </div>
            <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <input id="country" {...register('country')} className="input input-bordered w-full" />
                {errors.country && <p className="text-red-500">{errors.country.message}</p>}
            </div>
            <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions</label>
                <textarea id="instructions" {...register('instructions')} className="textarea textarea-bordered w-full"></textarea>
            </div>
            <div>
                <label htmlFor="shippingOther" className="block text-sm font-medium text-gray-700">Other Shipping Details</label>
                <textarea id="shippingOther" {...register('shippingOther')} className="textarea textarea-bordered w-full"></textarea>
            </div>
            <div>
                <label htmlFor="shippingDate" className="block text-sm font-medium text-gray-700">Shipping Date</label>
                <input id="shippingDate" type="date" {...register('shippingDate')} className="input input-bordered w-full" />
                {errors.shippingDate && <p className="text-red-500">{errors.shippingDate.message}</p>}
            </div>
            <div>
                <label htmlFor="shippingMethod" className="block text-sm font-medium text-gray-700">Shipping Method</label>
                <select id="shippingMethod" {...register('shippingMethod')} className="select select-bordered w-full">
                    <option value="Courier">Courier</option>
                    <option value="Deliver">Deliver</option>
                    <option value="DHL">DHL</option>
                    <option value="FedEx">FedEx</option>
                    <option value="Other">Other</option>
                    <option value="UPS">UPS</option>
                    <option value="USPS">USPS</option>
                </select>
                {errors.shippingMethod && <p className="text-red-500">{errors.shippingMethod.message}</p>}
            </div>
            <div>
                <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700">Shipping Cost</label>
                <input id="shippingCost" type="number" step="0.01" {...register('shippingCost', { valueAsNumber: true })} className="input input-bordered w-full" />
                {errors.shippingCost && <p className="text-red-500">{errors.shippingCost.message}</p>}
            </div>
            <div>
                <label htmlFor="shipToSameAsBillTo" className="block text-sm font-medium text-gray-700">Ship To Same As Bill To</label>
                <input id="shipToSameAsBillTo" type="checkbox" {...register('shipToSameAsBillTo')} className="checkbox" />
            </div>
            <div>
                <label htmlFor="attentionTo" className="block text-sm font-medium text-gray-700">Attention To</label>
                <input id="attentionTo" {...register('attentionTo')} className="input input-bordered w-full" />
                {errors.attentionTo && <p className="text-red-500">{errors.attentionTo.message}</p>}
            </div>
        </form>
    );
};

export default ShippingInfoForm;
