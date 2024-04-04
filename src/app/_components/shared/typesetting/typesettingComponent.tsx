"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "~/trpc/react";
import { Typesetting } from "@prisma/client";
import { z } from "zod";

type typesettingComponentProps = {
    typesetting: Typesetting[];
    workOrderId: string;
    orderId: string;
}

const TypesettingComponent: React.FC<typesettingComponentProps> = ({ typesetting, workOrderId = '', orderId = '' }) => {
    console.log('typesetting', typesetting);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState<Typesetting | null>(null);

    return (
        <>
            <div className="mb-4 grid-cols-2">
                <button className="btn btn-active btn-primary" onClick={() => setIsEditMode(true)}>
                    Add Typesetting
                </button>
                {/* When select changes, a new typeset object is chosen from the typesetting array */}
                <select className="select w-full max-w-xs"
                    onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedTypeset = typesetting.find((type) => type.id === selectedId);
                        console.log('selectedTypeset', selectedTypeset);
                        // refresh component so display updates
                        setCurrentItem(selectedTypeset);
                    }}
                >
                    <option disabled selected>Please choose a Typesetting Version to view.</option>
                    {typesetting.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.dateIn.toString()} - {type.timeIn.toString()}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4 gric-cols-4">
                {/* Show the selected typeset object, refresh component so data displays */}
                {currentItem && (
                    <div className="grid grid-cols-4 gap-4">
                        <div className="rounded-lg bg-white p-6 shadow-md">
                            <p className="mb-2 text-gray-600 text-md font-semibold">Date In</p>
                            <p className="text-sm">{currentItem.dateIn.toString()}</p>
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
                )}
            </div>
        </>
    );

};

export default TypesettingComponent;