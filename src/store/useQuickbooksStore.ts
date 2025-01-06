// src/store/useQuickbooksStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuickbooksStore {
    isAuthenticated: boolean;
}

export const useQuickbooksStore = create(persist<QuickbooksStore>(() => ({
    isAuthenticated: false,
}), {
    name: "quickbooks-store",
}));