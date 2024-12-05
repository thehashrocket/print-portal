// ~/app/_components/offices/OfficeForm.tsx
// TODO: Add edit form for office

"use client";

import React, { useState } from "react";
import { type SerializedOffice, SerializedAddress } from "~/types/serializedTypes";
import { normalizeAddress } from "~/utils/dataNormalization";
import { api } from "~/trpc/react";
import { Mail, MapPin, Plus, Trash } from "lucide-react"; // Added Plus and Trash icons
import { AddressType } from "@prisma/client";

type NewAddress = Omit<SerializedAddress, 'createdAt' | 'updatedAt' | 'quickbooksId'>;

export default function OfficeForm({ office }: { office: SerializedOffice }) {
    const utils = api.useUtils();
    const updateOfficeMutation = api.offices.update.useMutation({
        onSuccess: async () => {
            await utils.offices.getById.invalidate(office.id);
            const updatedOffice = await utils.offices.getById.fetch(office.id);
            if (updatedOffice) {
                setFormData({
                    name: updatedOffice.name,
                    addresses: updatedOffice.Addresses
                });
            }
        }
    });
    const deleteAddressMutation = api.offices.deleteAddress.useMutation({
        onSuccess: async () => {
            utils.offices.getById.invalidate(office.id);
            const updatedOffice = await utils.offices.getById.fetch(office.id);
            if (updatedOffice) {
                setFormData({
                    name: updatedOffice.name,
                    addresses: updatedOffice.Addresses
                });
            }
        }
    });

    const [formData, setFormData] = useState<{
        name: string;
        addresses: (SerializedAddress | NewAddress)[];
    }>({
        name: office.name,
        addresses: office.Addresses
    });

    // Handle adding a new address
    const handleAddAddress = () => {
        setFormData(prev => ({
            ...prev,
            addresses: [...prev.addresses, {
                id: `temp-${Date.now()}`,
                line1: "",
                line2: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
                telephoneNumber: "",
                addressType: AddressType.Billing,
                officeId: office.id,
                deleted: false
            }]
        }));
    };

    // Handle removing an address
    const handleRemoveAddress = async (addressId: string) => {
        if (addressId.startsWith('temp-')) {
            // For new/temporary addresses, just remove from state
            setFormData(prev => ({
                ...prev,
                addresses: prev.addresses.filter(addr => addr.id !== addressId)
            }));
        } else {
            // For existing addresses, call the API
            try {
                await deleteAddressMutation.mutateAsync(addressId);
            } catch (error) {
                console.error('Failed to delete address:', error);
            }
        }
    };

    // Handle address field changes
    const handleAddressChange = (addressId: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            addresses: prev.addresses.map(addr => 
                addr.id === addressId ? { ...addr, [field]: value } : addr
            )
        }));
    };

    // Add this new handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateOfficeMutation.mutateAsync({
                id: office.id,
                name: formData.name,
                addresses: formData.addresses.map(addr => ({
                    id: addr.id,
                    line1: addr.line1,
                    line2: addr.line2 || undefined,
                    city: addr.city,
                    state: addr.state,
                    zipCode: addr.zipCode,
                    country: addr.country,
                    telephoneNumber: addr.telephoneNumber,
                    addressType: addr.addressType,
                    officeId: addr.officeId
                }))
            });
        } catch (error) {
            console.error('Failed to update office:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow-md rounded-md">
            <div className="flex items-center space-x-2">
                <label className="block text-sm font-medium text-gray-700">Name:</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Addresses</h3>
                    <button
                        type="button"
                        onClick={handleAddAddress}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Address
                    </button>
                </div>

                {formData.addresses.map((address) => (
                    <div key={address.id} className="space-y-2 p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <select
                                    value={address.addressType}
                                    onChange={(e) => handleAddressChange(address.id, 'addressType', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    {Object.values(AddressType).map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveAddress(address.id)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>

                        <input
                            type="text"
                            value={address.line1}
                            onChange={(e) => handleAddressChange(address.id, 'line1', e.target.value)}
                            placeholder="Address Line 1"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <input
                            type="text"
                            value={address.line2 ?? ""}
                            onChange={(e) => handleAddressChange(address.id, 'line2', e.target.value)}
                            placeholder="Address Line 2 (Optional)"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={address.city}
                                onChange={(e) => handleAddressChange(address.id, 'city', e.target.value)}
                                placeholder="City"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <input
                                type="text"
                                value={address.state}
                                onChange={(e) => handleAddressChange(address.id, 'state', e.target.value)}
                                placeholder="State"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={address.zipCode}
                                onChange={(e) => handleAddressChange(address.id, 'zipCode', e.target.value)}
                                placeholder="Zip Code"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <input
                                type="text"
                                value={address.country}
                                onChange={(e) => handleAddressChange(address.id, 'country', e.target.value)}
                                placeholder="Country"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <input
                            type="tel"
                            value={address.telephoneNumber ?? ""}
                            onChange={(e) => handleAddressChange(address.id, 'telephoneNumber', e.target.value)}
                            placeholder="Telephone Number"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-end space-x-2">
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
}