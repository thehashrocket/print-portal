"use client";

import React, { use, useState, useEffect } from "react";
import { Typesetting, TypesettingOption, TypesettingProof } from "@prisma/client";
import TypesettingForm from "./typesettingForm";
import { api } from "~/trpc/react";
import TypesettingProofForm from "./typesettingProofForm";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';


dayjs.extend(utc);
dayjs.extend(timezone);

type TypesettingComponentProps = {
    typesetting: (Typesetting & {
        TypesettingOptions: TypesettingOption[];
        TypesettingProofs: TypesettingProof[];
    })[];
    workOrderItemId: string;
    orderItemId: string;
};

const TypesettingComponent: React.FC<TypesettingComponentProps> = ({
    typesetting = [],
    workOrderItemId = '',
    orderItemId = ''
}) => {
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<string | "">(
        typesetting.length > 0 ? typesetting[typesetting.length - 1]?.id || "" : ""
    );
    const [currentItem, setCurrentItem] = useState<Typesetting & {
        TypesettingOptions: TypesettingOption[];
        TypesettingProofs: TypesettingProof[];
    } | null>(null);

    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [addProofMode, setAddProofMode] = useState<boolean>(false);


    const updateTypesetting = api.typesetting.update.useMutation({
        onSuccess: (updatedTypesetting) => {
            setIsEditMode(false);
            // Set the value of typesetting to the returned values
            const typesettingOptions = currentItem?.TypesettingOptions || [];
            const typesettingProofs = currentItem?.TypesettingProofs || [];

            const updatedItem = {
                ...updatedTypesetting,
                TypesettingOptions: typesettingOptions,
                TypesettingProofs: typesettingProofs,
            };

            setCurrentItem(updatedItem);
            setSuccess("Typesetting updated successfully!");
        },
        onError: () => {
            setIsEditMode(false);
            setError("An error occurred while updating the typesetting.");
        },
    });

    const formatNumberAsCurrency = (value: number) => {
        // Add dollar sign, round to 2 decimal places, and add commas
        return `$${(value || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    }

    const formatDate = (date: Date) => {
        return dayjs.utc(date).tz(dayjs.tz.guess()).format('MMMM D, YYYY, h:mm A');
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString();
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedTypeset = typesetting.find((type) => type.id === selectedId) || null;
        setCurrentItem(selectedTypeset);
        setSelectedTypeId(selectedId);
    };

    useEffect(() => {
        if (selectedTypeId) {
            const selectedTypeset = typesetting.find((type) => type.id === selectedTypeId) || null;
            setCurrentItem(selectedTypeset);
        }
    }, [selectedTypeId, typesetting]);


    return (
        <>
            <div className="toast toast-top toast-end">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
            </div>
            <div className="mb-4 grid grid-cols-4 gap-4">
                <button className="btn btn-active btn-primary" onClick={() => setIsEditMode(true)}>
                    Add Typesetting
                </button>
                <select
                    className="select w-full max-w-xs"
                    value={selectedTypeId}
                    onChange={handleChange}
                >
                    {/* Option to prompt user selection */}
                    <option value="" disabled>Please choose a Typesetting Version to view.</option>
                    {typesetting.map((type) => (
                        <option key={type.id} value={type.id}>
                            {/* Assuming dateIn and timeIn are Date objects or ISO strings */}
                            {formatDate(type.dateIn)} - {type.timeIn}
                        </option>
                    ))}
                </select>
                <button className="btn btn-active btn-primary" onClick={() => setIsEditMode(true)}>
                    Edit Typesetting
                </button>
                <button className="btn btn-active btn-primary" onClick={() => setIsEditMode(true)}>
                    Delete Typesetting
                </button>
            </div>
            {/* Component to display selected typeset details */}
            {currentItem && (
                // if currentItem is not null display the details
                // if isEditMode is true display the form
                // else display the details
                (isEditMode ? (
                    <TypesettingForm
                        typesetting={currentItem}
                        workOrderItemId={workOrderItemId}
                        orderItemId={orderItemId}
                        onSubmit={(data) => {
                            const parsedData = {
                                ...data,
                                cost: data.cost ? parseFloat(data.cost) : undefined,
                                dateIn: data.dateIn ? new Date(data.dateIn).toISOString() : new Date().toISOString(),
                            };
                            // Handle form submission
                            updateTypesetting.mutate(parsedData);
                            setIsEditMode(false);
                        }}
                        onCancel={() => {
                            setIsEditMode(false);
                        }} /> // onSubmit function to handle form submission
                ) : (
                    <>
                        <>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <div className="rounded-lg bg-white p-6 shadow-md">
                                    <p className="mb-2 text-gray-600 text-md font-semibold">Date In</p>
                                    <p className="text-sm">{formatDate(currentItem.dateIn)}</p>
                                </div>
                                <div className="rounded-lg bg-white p-6 shadow-md">
                                    <p className="mb-2 text-gray-600 text-md font-semibold">Time In</p>
                                    <p className="text-sm">{currentItem.timeIn}</p>
                                </div>
                                <div className="rounded-lg bg-white p-6 shadow-md">
                                    <p className="mb-2 text-gray-600 text-md font-semibold">Cost</p>
                                    {/* Format as currency. */}
                                    <p className="text-sm">{formatNumberAsCurrency((Number(currentItem.cost)))}</p>
                                </div>
                                <div className="rounded-lg bg-white p-6 shadow-md">
                                    <p className="mb-2 text-gray-600 text-md font-semibold">Prep Time</p>
                                    <p className="text-sm">{currentItem.prepTime}</p>
                                </div>
                                <div className="rounded-lg bg-white p-6 shadow-md">
                                    <p className="mb-2 text-gray-600 text-md font-semibold">Plate Ran</p>
                                    <p className="text-sm">{currentItem.plateRan}</p>
                                </div>
                                <div className="rounded-lg bg-white p-6 shadow-md">
                                    <p className="mb-2 text-gray-600 text-md font-semibold">Approved</p>
                                    <p className="text-sm">{currentItem.approved ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        </>

                    </>
                ) // End of ternary operator
                )
            )}
            {currentItem && (
                <>
                    <>
                        <h3 className="text-lg text-gray-600 font-semibold">Options</h3>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {currentItem.TypesettingOptions.map((option) => (
                                <div key={option.id} className="rounded-lg bg-white p-6 shadow-md m-1">
                                    <p className="mb-2 text-gray-600 text-md font-semibold">Option</p>
                                    <p className="text-sm">{option.option}</p>
                                    <p className="mb-2 text-gray-600 text-md font-semibold">Selected</p>
                                    <p className="text-sm">{option.selected ? 'Yes' : 'No'}</p>
                                </div>
                            ))}
                        </div>
                    </>
                    <>
                        <h3 className="text-lg text-gray-600 font-semibold">Proofs</h3>
                        <div className="mb-4 grid grid-cols-4 gap-4">
                            <button className="btn btn-active btn-primary" onClick={() => setAddProofMode(true)}>
                                Add Proof
                            </button>
                        </div>
                        {/* Add/Create a Prrof */}
                        <div className="grid grid-cols-4 gap-4">
                            {addProofMode && (
                                <TypesettingProofForm
                                    typesettingId={currentItem.id}
                                    onSubmit={(data) => {
                                        // Receives a new TypesettingProof object from child component
                                        // Then add it to the currentItem.TypesettingProofs array

                                        setCurrentItem((prevItem) => {
                                            if (prevItem) {
                                                return {
                                                    ...prevItem,
                                                    TypesettingProofs: [...prevItem.TypesettingProofs, data],
                                                };
                                            }
                                            return prevItem;
                                        });
                                        setAddProofMode(false);
                                    }}
                                    onCancel={() => {
                                        setAddProofMode(false);
                                    }}
                                />
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {currentItem.TypesettingProofs.map((proof) => (
                                <div key={proof.id} className="rounded-lg bg-white p-6 shadow-md m-1">
                                    <p className="text-gray-600 text-sm font-semibold">Approved</p>
                                    <p className="mb-2 text-sm">{proof.approved ? 'Yes' : 'No'}</p>
                                    <p className="text-gray-600 text-sm font-semibold">Date Submitted</p>
                                    <p className="mb-2 text-sm">{proof.dateSubmitted ? formatDate(proof.dateSubmitted) : ''}</p>

                                    <p className="text-gray-600 text-sm font-semibold">Proof Number</p>
                                    <p className="text-sm">{proof.proofNumber}</p>
                                    <p className="text-gray-600 text-sm font-semibold">Notes</p>
                                    <p className="text-sm">{proof.notes}</p>
                                </div>
                            ))}
                        </div>
                    </>
                </>
            )}
        </>
    );
};

export default TypesettingComponent;