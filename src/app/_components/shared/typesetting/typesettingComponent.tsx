// ~/app/_components/shared/typesetting/typesettingComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useTypesettingContext, TypesettingWithRelations } from "~/app/contexts/TypesettingContext";
import TypesettingForm from "./typesettingForm";
import TypesettingProofForm from "./typesettingProofForm";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Decimal } from 'decimal.js';

dayjs.extend(utc);
dayjs.extend(timezone);

type TypesettingComponentProps = {
    workOrderItemId: string;
    orderItemId: string;
    initialTypesetting: TypesettingWithRelations[];
};

const TypesettingComponent: React.FC<TypesettingComponentProps> = ({
    workOrderItemId,
    orderItemId,
    initialTypesetting
}) => {
    const { typesetting, setTypesetting } = useTypesettingContext();
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [selectedTypeId, setSelectedTypeId] = useState<string>('');
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [addProofMode, setAddProofMode] = useState<boolean>(false);

    const formatNumberAsCurrency = (value: number) => {
        return `$${(value || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
    };

    const formatDate = (date: Date | string) => {
        return dayjs.utc(date).tz(dayjs.tz.guess()).format('MMMM D, YYYY, h:mm A');
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setSelectedTypeId(selectedId);
    };

    useEffect(() => {
        if (initialTypesetting && initialTypesetting.length > 0) {
            setTypesetting(initialTypesetting);
            const mostRecent = initialTypesetting.reduce((prev, current) =>
                (prev && prev.dateIn > current.dateIn) ? prev : current,
                initialTypesetting[0]
            );
            if (mostRecent) {
                setSelectedTypeId(mostRecent.id);
            }
        }
    }, [initialTypesetting, setTypesetting]);

    const currentItem = typesetting.find((type): type is TypesettingWithRelations => type.id === selectedTypeId) || {
        id: '', // Default ID
        dateIn: new Date(), // Default date
        timeIn: '',
        cost: new Decimal(0), // Default cost
        prepTime: 0,
        plateRan: '',
        approved: false,
        status: 'WaitingApproval',
        createdById: '', // Default createdById
        createdAt: new Date(), // Default createdAt
        updatedAt: new Date(), // Default updatedAt
        followUpNotes: '',
        orderItemId: null,
        workOrderItemId: null,
        TypesettingOptions: [],
        TypesettingProofs: [],
    };

    return (
        <>
            <div className="mb-4 grid grid-cols-4 gap-4">
                <button className="btn btn-active btn-primary" onClick={() => {
                    setMode('add');
                    setIsEditMode(true);
                }}>
                    Add Typesetting
                </button>
                <select
                    className="select w-full max-w-xs"
                    value={selectedTypeId}
                    onChange={handleChange}
                >
                    <option value="" disabled>Please choose a Typesetting Version to view.</option>
                    {typesetting.map((type) => (
                        <option key={type.id} value={type.id}>
                            {formatDate(type.dateIn)} - {type.timeIn}
                        </option>
                    ))}
                </select>
                <button className="btn btn-active btn-primary" onClick={() => {
                    setMode('edit');
                    setIsEditMode(true);
                }}>
                    Edit Typesetting
                </button>
                <button className="btn btn-active btn-primary" onClick={() => setIsEditMode(true)}>
                    Delete Typesetting
                </button>
            </div>
            {currentItem && (
                (isEditMode ? (
                    <TypesettingForm
                        typesetting={mode === 'edit' ? currentItem : undefined}
                        workOrderItemId={workOrderItemId}
                        orderItemId={orderItemId}
                        onSubmit={() => {
                            setIsEditMode(false);
                        }}
                        onCancel={() => {
                            setIsEditMode(false);
                        }} />
                ) : (
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
                                <p className="text-sm">{formatNumberAsCurrency(Number(currentItem.cost))}</p>
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
                        <div>
                            <h3 className="text-lg text-gray-600 font-semibold">Proofs</h3>
                            <div className="mb-4 grid grid-cols-4 gap-4">
                                <button className="btn btn-active btn-primary" onClick={() => setAddProofMode(true)}>
                                    Add Proof
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                {addProofMode && (
                                    <TypesettingProofForm
                                        typesettingId={currentItem.id}
                                        onSubmit={() => {
                                            setAddProofMode(false);
                                        }}
                                        onCancel={() => {
                                            setAddProofMode(false);
                                        }}
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                {currentItem.TypesettingProofs?.map((proof) => (
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
                        </div>
                    </>
                ))
            )}
        </>
    );
};

export default TypesettingComponent;
