"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successAction = successAction;
exports.failAction = failAction;
const status_1 = require("./status");
function successAction(data, message = "OK", success = true) {
    return { statusCode: status_1.status.SUCCESS, message, success, ...data };
}
function failAction(message = 'Server error', statusCode = status_1.status.FAILURE) {
    return { statusCode, message, success: false };
}
