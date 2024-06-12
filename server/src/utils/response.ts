import { status } from "./status";

export function successAction<T>(data: T, message = "OK", success = true) {
    return { statusCode: status.SUCCESS, message, success, data };
}

export function failAction(message: string = 'Server error', statusCode: number = status.FAILURE) {
    return { statusCode, message, success: false };
}
