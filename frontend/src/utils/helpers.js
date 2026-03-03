/**
 * Format number to Indonesian Rupiah
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format date string to localized display
 */
export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * Calculate number of nights between two dates
 */
export const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

/**
 * Format date object to YYYY-MM-DD using LOCAL timezone
 */
const toLocalDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
export const getToday = () => {
    return toLocalDateStr(new Date());
};

/**
 * Get a date N days from now in YYYY-MM-DD format (local timezone)
 */
export const getFutureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return toLocalDateStr(date);
};
