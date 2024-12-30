// ~/app/_components/offices/OfficeForm.tsx
// TODO: Add edit form for office

"use client";

import React, { useState } from "react";
import { type SerializedOffice, SerializedAddress } from "~/types/serializedTypes";
import { normalizeAddress } from "~/utils/dataNormalization";
import { api } from "~/trpc/react";
import { Mail, MapPin, Plus, Trash } from "lucide-react"; // Added Plus and Trash icons
import { AddressType } from "@prisma/client";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { SelectField } from "../shared/ui/SelectField/SelectField";
import { Input } from "../ui/input";

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
                name: "",
                line1: "",
                line2: "",
                line3: "",
                line4: "",
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
                    name: addr.name ?? undefined,
                    line1: addr.line1,
                    line2: addr.line2 || undefined,
                    line3: addr.line3 || undefined,
                    line4: addr.line4 || undefined,
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
                <Label htmlFor="name">Name:</Label>
                <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Addresses</h3>
                    <Button
                        variant="secondary"
                        onClick={handleAddAddress}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Address
                    </Button>
                </div>

                {formData.addresses.map((address) => (
                    <div key={address.id} className="space-y-2 p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <SelectField
                                    options={Object.values(AddressType).map(type => ({ value: type, label: type }))}
                                    value={address.addressType}
                                    onValueChange={(value) => handleAddressChange(address.id, 'addressType', value)}
                                    placeholder="Select Address Type"
                                />
                            </div>
                            <Button
                                variant="destructive"
                                onClick={() => handleRemoveAddress(address.id)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>

                        <Input
                            id="name"
                            type="text"
                            value={address.name ?? ''}
                            onChange={(e) => handleAddressChange(address.id, 'name', e.target.value)}
                            placeholder="Address Name"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />

                        <Input
                            id="line1"
                            type="text"
                            value={address.line1}
                            onChange={(e) => handleAddressChange(address.id, 'line1', e.target.value)}
                            placeholder="Address Line 1"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <Input
                            id="line2"
                            type="text"
                            value={address.line2 ?? ""}
                            onChange={(e) => handleAddressChange(address.id, 'line2', e.target.value)}
                            placeholder="Address Line 2 (Optional)"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <Input
                            id="line3"
                            type="text"
                            value={address.line3 ?? ""}
                            onChange={(e) => handleAddressChange(address.id, 'line3', e.target.value)}
                            placeholder="Address Line 3 (Optional)"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <Input
                            id="line4"
                            type="text"
                            value={address.line4 ?? ""}
                            onChange={(e) => handleAddressChange(address.id, 'line4', e.target.value)}
                            placeholder="Address Line 4 (Optional)"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                id="city"
                                type="text"
                                value={address.city}
                                onChange={(e) => handleAddressChange(address.id, 'city', e.target.value)}
                                placeholder="City"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <Input
                                id="state"
                                type="text"
                                value={address.state}
                                onChange={(e) => handleAddressChange(address.id, 'state', e.target.value)}
                                placeholder="State"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                id="zipCode"
                                type="text"
                                value={address.zipCode}
                                onChange={(e) => handleAddressChange(address.id, 'zipCode', e.target.value)}
                                placeholder="Zip Code"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <Input
                                id="country"
                                type="text"
                                value={address.country}
                                onChange={(e) => handleAddressChange(address.id, 'country', e.target.value)}
                                placeholder="Country"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <Input
                            id="telephoneNumber"
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
                <Button
                    variant="default"
                    type="submit"
                >
                    Save Changes
                </Button>
            </div>
        </form>
    );
}