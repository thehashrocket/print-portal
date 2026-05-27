"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import dayjs from "dayjs";

type ChangedField = { from: unknown; to: unknown };

function formatFieldValue(value: unknown): string {
    const s = String(value);
    return s === "null" || s === "undefined" ? "—" : s;
}

function FieldChanges({ changedFields }: { changedFields: unknown }) {
    if (!changedFields || typeof changedFields !== "object") return null;
    const entries = Object.entries(changedFields as Record<string, ChangedField>);
    if (entries.length === 0) return null;

    return (
        <div className="mt-1 space-y-0.5">
            {entries.map(([key, { from, to }]) => (
                <div key={key} className="text-xs text-gray-600">
                    <span className="font-medium">{key}</span>:{" "}
                    <span className="line-through text-red-500">{formatFieldValue(from)}</span>
                    {" → "}
                    <span className="text-green-600">{formatFieldValue(to)}</span>
                </div>
            ))}
        </div>
    );
}

export default function OrderAuditTimeline({ orderId }: { orderId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const { data: orderVersions, isLoading: loadingOV } = api.orderVersions.getByOrderId.useQuery(
        { orderId },
        { enabled: isOpen },
    );
    const { data: itemVersions, isLoading: loadingIV } = api.orderItemVersions.getByOrderId.useQuery(
        { orderId },
        { enabled: isOpen },
    );

    const isLoading = loadingOV || loadingIV;

    const entries = [
        ...(orderVersions ?? []).map((v) => ({ ...v, entryType: "order" as const })),
        ...(itemVersions ?? []).map((v) => ({ ...v, entryType: "item" as const })),
    ].sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());

    return (
        <section className="bg-white p-4 rounded-lg shadow-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                className="flex items-center gap-2 w-full text-left"
            >
                {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
                <span className="text-2xl font-semibold">Change History</span>
            </button>

            {isOpen && (
                <div className="mt-4">
                    {isLoading ? (
                        <p className="text-gray-500 text-sm">Loading...</p>
                    ) : entries.length === 0 ? (
                        <p className="text-gray-500 text-sm">No change history recorded yet.</p>
                    ) : (
                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-4 pl-1">
                            {entries.map((entry) => (
                                <div key={entry.id} className="relative pl-5">
                                    <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-gray-300 border-2 border-white" />
                                    <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                                        <Clock className="w-3 h-3 shrink-0" />
                                        <span>{dayjs(entry.changedAt).format("MMM D, YYYY h:mm A")}</span>
                                        <span>·</span>
                                        <span className="font-medium text-gray-700">{entry.changedBy.name}</span>
                                        {entry.entryType === "item" && (
                                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                                item
                                            </span>
                                        )}
                                    </div>
                                    {(entry.previousStatus ?? entry.newStatus) && (
                                        <div className="text-sm mt-0.5 text-gray-700">
                                            {"previousStatus" in entry && entry.previousStatus && (
                                                <span className="line-through text-gray-400 mr-1">
                                                    {entry.previousStatus}
                                                </span>
                                            )}
                                            {entry.previousStatus && entry.newStatus && "→ "}
                                            {entry.newStatus && (
                                                <span className="font-medium">{entry.newStatus}</span>
                                            )}
                                        </div>
                                    )}
                                    <FieldChanges changedFields={entry.changedFields} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
