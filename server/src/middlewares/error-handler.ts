import { NextFunction, Request, Response } from "express";

import { AppError, ValidationError, ForeignKeyViolationError, DuplicateEntryError, NotNullError } from '../types/mysql-errors.types';
import { failAction } from "../utils/response";

function extractColumnNameFromErrorMessage(sqlMessage: string): string {
    // Example: sqlMessage might be "Column 'fullName' cannot be null"
    const matches = sqlMessage.match(/Column '(.*?)' cannot be null/);
    return matches ? matches[1] : 'Unknown Column';
}

export const errorHandler = (err: AppError, _: Request, res: Response, next: NextFunction): Response => {
    // console.log("Server error ==> ", err);
    console.log("Server error mess ==> ", err.message);

    if (typeof err === 'string') {
        return res.status(400).send(failAction(err));
    }

    if (err.message === 'Illegal arguments: object, number') {
        return res.status(400).send(failAction("Password cannot be null or empty"));
    }

    if (err.name === 'ValidationError') {
        const valErrors: string[] = [];
        Object.keys((err as ValidationError).errors).forEach(key => valErrors.push((err as ValidationError).errors[key].message));
        return res.status(422).send(failAction(valErrors.join(', ')));
    }

    if ((err as ForeignKeyViolationError).code === 'ER_ROW_IS_REFERENCED_2' || (err as ForeignKeyViolationError).code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).send(failAction('Foreign key constraint fails.'));
    }

    if ((err as DuplicateEntryError).code === 'ER_DUP_ENTRY') {
        return res.status(422).send(failAction('Duplicate entry error: ' + (err as DuplicateEntryError).sqlMessage));
    }

    if ((err as NotNullError).code === 'ER_BAD_NULL_ERROR') {
        // Extract the column name from the error message, if needed
        const columnName = extractColumnNameFromErrorMessage((err as NotNullError).sqlMessage);
        return res.status(400).send(failAction(`Column '${columnName}' cannot be null or empty`));
    }

    return res.status(500).send(failAction('Internal server error', 500));
};
