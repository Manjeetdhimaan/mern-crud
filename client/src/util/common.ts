export const convertToUTC = (localDate: Date): Date => {
    // Get the year, month, day, hours, minutes, and seconds in local time
    const now = new Date(localDate); // Current local date and time
    const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    return utcDate;
};

export const getCurrentUTCDate = (): Date => {
    const now = new Date(); // Current local date and time
    const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    return utcDate;
};
