"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUTCDate = exports.convertToUTC = void 0;
const convertToUTC = (localDate) => {
    // Get the year, month, day, hours, minutes, and seconds in local time
    const now = new Date(localDate); // Current local date and time
    const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    return utcDate;
};
exports.convertToUTC = convertToUTC;
const getCurrentUTCDate = () => {
    const now = new Date(); // Current local date and time
    const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    return utcDate;
};
exports.getCurrentUTCDate = getCurrentUTCDate;
