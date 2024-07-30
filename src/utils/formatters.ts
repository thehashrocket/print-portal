// ~/src/utils/formatters.ts

export const formatCurrency = (amount: number | string): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(numericAmount);
};

export const formatDate = (date: Date | string): string => {
    const dateObject = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObject.getTime())) {
        return 'Invalid Date';
    }
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(dateObject);
};