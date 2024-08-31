"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canUser = void 0;
const response_1 = require("../utils/response");
//* Always use actionData in singular form ( correct > (user:view), wrong > (users:view) )
// example: canUser('user:view'), canUser('ticket:update');
const canUser = (actionData) => {
    return (req, res, next) => {
        const userRole = req._userRole;
        if (!userRole || !actionData) {
            return res.status(401).json((0, response_1.failAction)("Not authorized to call this API"));
        }
        const splitActionData = actionData.split(":");
        const action = splitActionData[0];
        const actionType = splitActionData[1];
        const foundAction = userRole.grants.find(grant => grant.split(':')[0] === action);
        let foundActionType;
        if (foundAction) {
            foundActionType = foundAction.split(':');
            if (foundActionType[1] === '*') {
                return next();
            }
            else if (foundActionType[1].includes(actionType)) {
                return next();
            }
            else {
                return res.status(401).json((0, response_1.failAction)("Not authorized to call this API"));
            }
        }
        else {
            return res.status(401).json((0, response_1.failAction)("Not authorized to call this API"));
        }
    };
};
exports.canUser = canUser;
