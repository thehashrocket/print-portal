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
        <div className="space-y-6">
            {/* Controls Section */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                        variant="default"
                        onClick={() => {
                            setMode('add');
                            setIsEditMode(true);
                        }}
                        className="w-full"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Typesetting
                    </Button>

                    <div className="w-full">
                        <SelectField
                            options={typesetting.map((type) => ({
                                value: type.id,
                                label: `${formatDate(type.dateIn)} - ${type.timeIn}`
                            }))}
                            value={selectedTypeId}
                            onValueChange={handleChange}
                            placeholder="Select version..."
                            required={true}
                        />
                    </div>

                    <Button
                        variant="default"
                        onClick={() => {
                            setMode('edit');
                            setIsEditMode(true);
                        }}
                        className="w-full"
                    >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Typesetting
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={() => setIsEditMode(true)}
                        className="w-full"
                    >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete Typesetting
                    </Button>
                </div>
            </div>

            {currentItem && (
                (isEditMode ? (
                    <div className="w-full">
                        <TypesettingForm
                            typesetting={mode === 'edit' ? currentItem : undefined}
                            workOrderItemId={workOrderItemId}
                            orderItemId={orderItemId}
                            onSubmit={handleNewTypesetting}
                            onCancel={() => setIsEditMode(false)}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="rounded-lg bg-white p-4 shadow-md">
                                <p className="mb-2 text-gray-600 text-sm font-semibold">Date In</p>
                                <p className="text-sm">{formatDate(currentItem.dateIn)}</p>
                            </div>
                            <div className="rounded-lg bg-white p-4 shadow-md">
                                <p className="mb-2 text-gray-600 text-sm font-semibold">Time In</p>
                                <p className="text-sm">{currentItem.timeIn}</p>
                            </div>
                            <div className="rounded-lg bg-white p-4 shadow-md">
                                <p className="mb-2 text-gray-600 text-sm font-semibold">Cost</p>
                                <p className="text-sm">{formatCurrency(Number(currentItem.cost))}</p>
                            </div>
                            <div className="rounded-lg bg-white p-4 shadow-md">
                                <p className="mb-2 text-gray-600 text-sm font-semibold">Prep Time</p>
                                <p className="text-sm">{currentItem.prepTime}</p>
                            </div>
                            <div className="rounded-lg bg-white p-4 shadow-md">
                                <p className="mb-2 text-gray-600 text-sm font-semibold">Plate Ran</p>
                                <p className="text-sm">{currentItem.plateRan}</p>
                            </div>
                            <div className="rounded-lg bg-white p-4 shadow-md">
                                <p className="mb-2 text-gray-600 text-sm font-semibold">Approved</p>
                                <p className="text-sm">{currentItem.approved ? 'Yes' : 'No'}</p>
                            </div>
                        </div>

                        {/* Proofs Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="text-lg text-gray-600 font-semibold">Proofs</h3>
                                <Button
                                    variant="default"
                                    onClick={() => setAddProofMode(true)}
                                    className="shrink-0"  // This prevents the button from shrinking
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Proof
                                </Button>
                            </div>

                            {addProofMode && (
                                <div className="w-full">
                                    <TypesettingProofForm
                                        typesettingId={currentItem.id}
                                        onSubmit={() => setAddProofMode(false)}
                                        onCancel={() => setAddProofMode(false)}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {currentItem.TypesettingProofs?.map((proof) => (
                                    <div key={proof.id} className="rounded-lg bg-white p-4 shadow-md">
                                        <div className="space-y-3">
                                            {proof.artwork.map((artwork) => (
                                                <ArtworkComponent
                                                    key={artwork.id}
                                                    artworkUrl={artwork.fileUrl}
                                                    artworkDescription={artwork.description}
                                                />
                                            ))}
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-semibold">Approved</p>
                                                    <p className="text-sm">{proof.approved ? 'Yes' : 'No'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 text-sm font-semibold">Date Submitted</p>
                                                    <p className="text-sm">{proof.dateSubmitted ? formatDate(proof.dateSubmitted) : ''}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 text-sm font-semibold">Proof Number</p>
                                                    <p className="text-sm">{proof.proofNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 text-sm font-semibold">Notes</p>
                                                    <p className="text-sm">{proof.notes}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="default"
                                                className="w-full mt-3"
                                                onClick={() => generateProofPDF(proof)}
                                            >
                                                <Printer className="w-4 h-4 mr-2" />
                                                Print Proof
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default TypesettingComponent;