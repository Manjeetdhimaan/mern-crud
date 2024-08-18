const convertToUTC = (localDate: Date): Date => {
    // Get the year, month, day, hours, minutes, and seconds in local time
    const now = new Date(localDate); // Current local date and time
    const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    return utcDate;
};

const getCurrentUTCDate = (): Date => {
    const now = new Date(); // Current local date and time
    const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    // new Date().toISOString().slice(0, 19).replace('T', ' ') // this is also used to get current UTC time
    return utcDate;
};

const today = (): number => {
    return new Date().getDate();
};
const getFormattedDate = (date: string): string => {
    const foundDate = new Date(date).getDate();
    const foundMonth = new Date(date).getMonth();
    const foundYear = new Date(date).getFullYear();
    return `${foundDate}-${foundMonth}-${foundYear}`;
}

const getMediumDate = (date: Date) => {
    const currentDate = date.getDate();
    const currentMonth = date.getMonth();
    return (currentDate > 9 ? currentDate : "0" + currentDate) + '-' + (currentMonth + 1 > 9 ? currentMonth + 1 : "0" + (currentMonth + 1)) + '-' + (date.getFullYear())
}

const getDate = (date: string): number => {
    return new Date(date).getDate();
}

export {convertToUTC, getCurrentUTCDate, today, getFormattedDate, getDate, getMediumDate}
