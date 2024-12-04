// ~/app/_components/offices/OfficeForm.tsx
// TODO: Add edit form for office

"use client";

import React from "react";
import { type SerializedOffice } from "~/types/serializedTypes";
import { Mail, MapPin } from "lucide-react"; // Example icons


export default function OfficeForm({ office }: { office: SerializedOffice }) {
    return (
        <form className="space-y-4 p-4 bg-white shadow-md rounded-md">
            <div className="flex items-center space-x-2">
                <label className="block text-sm font-medium text-gray-700">Name:</label>
                <input
                    type="text"
                    value={office.name}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            {/* Loop through addresses and display them */}
            {office.Addresses.map((address) => (
                <div key={address.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <label className="block text-sm font-medium text-gray-700">{address.addressType}:</label>
                    </div>
                    <input
                        type="text"
                        value={address.line1}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                        type="text"
                        value={address.line2 ?? ""}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                        type="text"
                        value={address.city}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                        type="text"
                        value={address.state}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                        type="text"
                        value={address.zipCode}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                        type="text"
                        value={address.country}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            ))}
        </form>
    );
}