import { create } from 'zustand';
import { type StockStatus } from '@prisma/client';

export interface TempWorkOrderItemStock {
    stockQty: number;
    costPerM: number;
    totalCost?: number;
    from?: string;
    expectedDate?: Date;
    orderedDate?: Date;
    paperProductId?: string;
    received: boolean;
    receivedDate?: Date;
    notes?: string;
    stockStatus: StockStatus;
    supplier?: string;
}

interface WorkOrderItemStockState {
    tempStocks: TempWorkOrderItemStock[];
    addTempStock: (stock: TempWorkOrderItemStock) => void;
    removeTempStock: (index: number) => void;
    clearTempStocks: () => void;
}

export const useWorkOrderItemStockStore = create<WorkOrderItemStockState>((set) => ({
    tempStocks: [],
    addTempStock: (stock) => set((state) => ({ 
        tempStocks: [...state.tempStocks, stock] 
    })),
    removeTempStock: (index) => set((state) => ({
        tempStocks: state.tempStocks.filter((_, i) => i !== index)
    })),
    clearTempStocks: () => set({ tempStocks: [] }),
})); 