// ~/src/utils/formatters.ts

import {
    type ValueFormatterParams,
} from "@ag-grid-community/core";
import { PaperProduct } from "@prisma/client";

export const formatCurrency = (amount: number | string): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
    }).format(numericAmount);
};

export const formatDate = (date: Date | string): string => {
    let dateObject: Date;

    if (date instanceof Date) {
        dateObject = date;
    } else if (typeof date === 'string') {
        // Check if the date string is in the format you're receiving
        if (date.includes('GMT')) {
            // If it is, we can directly create a Date object from it
            dateObject = new Date(date);
        } else {
            // If not, try parsing as ISO string (fallback)
            dateObject = new Date(date);
        }
    } else {
        return 'Invalid Date';
    }

    if (isNaN(dateObject.getTime())) {
        return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(dateObject);
};

export const formatDateTime = (date: Date | string): string => {
    let dateObject: Date;

    if (date instanceof Date) {
        dateObject = date;
    } else if (typeof date === 'string') {
        // Check if the date string is in the format you're receiving
        if (date.includes('GMT')) {
            // If it is, we can directly create a Date object from it
            dateObject = new Date(date);
        } else {
            // If not, try parsing as ISO string (fallback)
            dateObject = new Date(date);
        }
    } else {
        return 'Invalid Date';
    }

    if (isNaN(dateObject.getTime())) {
        return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }).format(dateObject);
}

// Time is in the 24 hour format HH:MM
// Formatting is HH:MM AM/PM
export const formatTime = (time: string): string => {
    if (!time) return 'N/A';
    // Parse the 24-hour time string (HH:MM)
    const [hours = 0, minutes = 0] = time.split(':').map(Number);
    
    // Create a date object for today with the specified time
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(date);
}

export const formatNumber = (number: number): string => {
    return new Intl.NumberFormat('en-US').format(number);
};

export const formatPercentage = (percentage: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
    }).format(percentage);
}

export const formatDateInTable = (params: ValueFormatterParams) => {
    // Check for NULL values before formatting
    if (params.value === null) return 'N/A';
    return new Date(params.value).toLocaleDateString();
};

export const formatNumberAsCurrencyInTable = (params: ValueFormatterParams) => {
    if (params.value === null) return "$0.00";
    return `$${Number(params.value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
};

export const formatPaperProductLabel = (product: PaperProduct) => {
    if (!product) return '';
    if (product.customDescription) {
        return product.customDescription;
    }
    return `${product.brand} ${product.finish} ${product.paperType} ${product.size} ${product.weightLb}lbs.`;
};