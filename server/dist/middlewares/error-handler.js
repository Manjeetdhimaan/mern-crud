"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
function extractColumnNameFromErrorMessage(sqlMessage) {
    // Example: sqlMessage might be "Column 'fullName' cannot be null"
    const matches = sqlMessage.match(/Column '(.*?)' cannot be null/);
    return matches ? matches[1] : 'Unknown Column';
}
const errorHandler = (err, _, res, next) => {
    // console.log("Server error ==> ", err);
    console.log("Server error message ==> ", err.message);
    if (typeof err === 'string') {
        return res.status(400).send((0, response_1.failAction)(err));
    }
    if (err.message === 'Illegal arguments: object, number') {
        return res.status(400).send((0, response_1.failAction)("Password cannot be null or empty"));
    }
    if (err.name === 'ValidationError') {
        const valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        return res.status(422).send((0, response_1.failAction)(valErrors.join(', ')));
    }
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).send((0, response_1.failAction)('Foreign key constraint fails.'));
    }
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(422).send((0, response_1.failAction)('Duplicate entry error: ' + err.sqlMessage));
    }
    if (err.code === 'ER_BAD_NULL_ERROR') {
        // Extract the column name from the error message, if needed
        const columnName = extractColumnNameFromErrorMessage(err.sqlMessage);
        return res.status(400).send((0, response_1.failAction)(`Column '${columnName}' cannot be null or empty`));
    }
    return res.status(500).send((0, response_1.failAction)('Internal server error', 500));
};
exports.errorHandler = errorHandler;
