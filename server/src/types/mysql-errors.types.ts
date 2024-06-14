// import { Error } from 'mysql2';

export interface ValidationError extends Error {
    name: 'ValidationError';
    errors: Record<string, { message: string }>;
}

// Define other MySQL-specific errors as needed
export interface ForeignKeyViolationError extends Error {
    code: 'ER_ROW_IS_REFERENCED_2' | 'ER_NO_REFERENCED_ROW_2';
}

export interface DuplicateEntryError extends Error {
    code: 'ER_DUP_ENTRY';
    sqlMessage: string;
}

export interface NotNullError extends Error {
    code: 'ER_BAD_NULL_ERROR';
    sqlMessage: string;
}

// Combine all error types into a union type
export type AppError = ValidationError | ForeignKeyViolationError | DuplicateEntryError | Error;
