// ~/src/utils/dashboardHelpers.ts

/**
 * Calculates the number of days until a given due date.
 * Positive = days remaining, 0 or negative = overdue.
 */
export const calculateDaysUntilDue = (dateString: string): number => {
    const targetDate = new Date(dateString);
    const currentDate = new Date();
    const timeDiff = targetDate.getTime() - currentDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Returns an HSL border color string based on how close an item is to its due date.
 * - green HSL if completed or more than 1 day remaining
 * - yellow HSL if exactly 1 day remaining
 * - red HSL if overdue (0 or fewer days)
 */
export const dueDateBorderColor = (dateString: string, isCompleted: boolean): string => {
    if (isCompleted) return 'hsl(142, 71%, 45%)';
    const daysUntilDue = calculateDaysUntilDue(dateString);
    if (daysUntilDue === 1) return 'hsl(45, 93%, 47%)';
    if (daysUntilDue <= 0) return 'hsl(0, 84%, 60%)';
    return 'hsl(142, 71%, 45%)';
};
