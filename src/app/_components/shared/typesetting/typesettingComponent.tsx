"use client";
import React, { useEffect, useState } from "react";
import { useTypesettingContext, type TypesettingWithRelations } from "~/app/contexts/TypesettingContext";
import TypesettingForm from "./typesettingForm";
import TypesettingProofForm from "./typesettingProofForm";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { formatDate, formatCurrency } from "~/utils/formatters";
import ArtworkComponent from "../artworkComponent/artworkComponent";
import { Button } from "../../ui/button";
import { Pencil, PlusCircle, Printer, Trash } from "lucide-react";
import { SelectField } from "../../shared/ui/SelectField/SelectField";
import { generateProofPDF } from "~/utils/generateProofPDF";
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

    const handleChange = (value: string) => {
        setSelectedTypeId(value);
    };

    useEffect(() => {
        if (initialTypesetting && initialTypesetting.length > 0) {
            setTypesetting(initialTypesetting);
            const mostRecent = initialTypesetting.reduce((prev, current) =>
                (prev.dateIn > current.dateIn) ? prev : current
            );
            setSelectedTypeId(mostRecent.id);
        }
    }, [initialTypesetting, setTypesetting]);

    const handleNewTypesetting = (newTypesetting: TypesettingWithRelations) => {
        setTypesetting((prev: TypesettingWithRelations[]) => {
            const index = prev.findIndex((t: TypesettingWithRelations) => t.id === newTypesetting.id);
            if (index !== -1) {
                // Update existing typesetting
                return prev.map((t, i) => i === index ? newTypesetting : t);
            } else {
                // Add new typesetting
                return [...prev, newTypesetting];
            }
        });
        setSelectedTypeId(newTypesetting.id);
        setIsEditMode(false);
    };

    const currentItem = typesetting.find(type => type.id === selectedTypeId) || {
        id: '',
        dateIn: new Date().toISOString(),
        timeIn: '',
        cost: '0',
        prepTime: 0,
        plateRan: '',
        approved: false,
        status: 'WaitingApproval',
        createdById: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        followUpNotes: '',
        orderItemId: null,
        workOrderItemId: null,
        TypesettingOptions: [],
        TypesettingProofs: [],
    };

    return (
        <>
            {/* Buttons and dropdown */}
            <div className="mb-4 grid grid-cols-4 gap-4">
                <Button
                    variant="default"
                    onClick={() => {
                        setMode('add');
                        setIsEditMode(true);
                    }}
                >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Typesetting
                </Button>
                <SelectField
                    options={typesetting.map((type) => ({ value: type.id, label: `${formatDate(type.dateIn)} - ${type.timeIn}` }))}
                    value={selectedTypeId}
                    onValueChange={handleChange}
                    placeholder="Please choose a Typesetting Version to view."
                    required={true}
                />
                <Button
                    variant="default"
                    onClick={() => {
                        setMode('edit');
                        setIsEditMode(true);
                    }}
                >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Typesetting
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => setIsEditMode(true)}
                >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Typesetting
                </Button>
            </div>
            {currentItem && (
                (isEditMode ? (
                    <TypesettingForm
                        typesetting={mode === 'edit' ? currentItem : undefined}
                        workOrderItemId={workOrderItemId}
                        orderItemId={orderItemId}
                        onSubmit={handleNewTypesetting}
                        onCancel={() => setIsEditMode(false)}
                    />
                ) : (
                    <>
                        {/* Display typesetting details */}
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
                                <p className="text-sm">{formatCurrency(Number(currentItem.cost))}</p>
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
                        {/* Display proofs */}
                        <div>
                            <h3 className="text-lg text-gray-600 font-semibold">Proofs</h3>
                            <div className="mb-4 grid grid-cols-4 gap-4">
                                <Button
                                    variant="default"
                                    onClick={() => setAddProofMode(true)}
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Proof
                                </Button>
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
                                    <div key={proof.id} className="rounded-lg bg-white p-6 shadow-md m-3">
                                        {proof.artwork.map((artwork) => (
                                            <ArtworkComponent key={artwork.id} artworkUrl={artwork.fileUrl} artworkDescription={artwork.description} />
                                        ))}
                                        <p className="text-gray-600 text-sm font-semibold">Approved</p>
                                        <p className="mb-2 text-sm">{proof.approved ? 'Yes' : 'No'}</p>
                                        <p className="text-gray-600 text-sm font-semibold">Date Submitted</p>
                                        <p className="mb-2 text-sm">{proof.dateSubmitted ? formatDate(proof.dateSubmitted) : ''}</p>
                                        <p className="text-gray-600 text-sm font-semibold">Proof Number</p>
                                        <p className="text-sm">{proof.proofNumber}</p>
                                        <p className="text-gray-600 text-sm font-semibold">Notes</p>
                                        <p className="text-sm">{proof.notes}</p>
                                        <Button variant="default" onClick={() => {
                                            generateProofPDF(proof);
                                        }}>
                                            <Printer className="w-4 h-4 mr-2" />
                                            Print Proof
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ))
            )}
        </>
    );
}

export default TypesettingComponent;