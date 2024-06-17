"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failAction = exports.successAction = void 0;
const status_1 = require("./status");
function successAction(data, message = "OK", success = true) {
    return { statusCode: status_1.status.SUCCESS, message, success, data };
}
exports.successAction = successAction;
function failAction(message = 'Server error', statusCode = status_1.status.FAILURE) {
    return { statusCode, message, success: false };
}
exports.failAction = failAction;
