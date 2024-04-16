"use client";

import React, { use, useState, useEffect } from "react";
import { Typesetting } from "@prisma/client";

type TypesettingComponentProps = {
    typesetting: Typesetting[];
    workOrderId: string;
    orderId: string;
};

const TypesettingComponent: React.FC<TypesettingComponentProps> = ({ typesetting, workOrderId = '', orderId = '' }) => {
    const [selectedTypeId, setSelectedTypeId] = useState<string | "">(
        (typesetting || []).length > 0 ? typesetting[typesetting.length - 1].id : ""
    );
    const [currentItem, setCurrentItem] = useState<Typesetting | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    const formatDate = (date: Date) => {
        return date.toString();
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString();
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedTypeset = typesetting.find((type) => type.id === selectedId) || null;
        setCurrentItem(selectedTypeset);
        setSelectedTypeId(selectedId);
        console.log('currentItem', currentItem);
    };

    useEffect(() => {
        if (selectedTypeId) {
            const selectedTypeset = typesetting.find((type) => type.id === selectedTypeId) || null;
            setCurrentItem(selectedTypeset);
        }
    }, [selectedTypeId, typesetting]);


    return (
        <>
            <div className="mb-4 grid grid-cols-2">
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
            </div>
            {/* Component to display selected typeset details */}
            {currentItem && (
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
                            <p className="text-sm">{String(currentItem.cost)}</p>
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
                    <h3 className="text-lg text-gray-600 font-semibold">Proofs</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {currentItem.TypesettingProofs.map((proof) => (
                            <div key={proof.id} className="rounded-lg bg-white p-6 shadow-md m-1">
                                <p className="mb-2 text-gray-600 text-md font-semibold">Proof</p>
                                <p className="text-sm">{proof.proof}</p>
                                <p className="mb-2 text-gray-600 text-md font-semibold">Approved</p>
                                <p className="text-sm">{proof.approved ? 'Yes' : 'No'}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );
};

export default TypesettingComponent;