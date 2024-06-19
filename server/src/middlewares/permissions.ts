import { NextFunction, Response } from "express";

import { failAction } from "../utils/response";
import { IRequest } from "../types/common.types";

declare type TCanUser = (req: IRequest, res: Response, next: NextFunction) => Response | void;

//* Always use actionData in singular form ( correct > (user:view), wrong > (users:view) )
// example: canUser('user:view'), canUser('ticket:update');
export const canUser = (actionData: string): TCanUser => {
    return (req: IRequest, res: Response, next: NextFunction): Response | void => {
        const userRole = req._userRole;
        if (!userRole || !actionData) {
            return res.status(401).json(failAction("Not authorized to call this API"));
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
                return res.status(401).json(failAction("Not authorized to call this API"));
            }
        }
        else {
            return res.status(401).json(failAction("Not authorized to call this API"));
        }
    };

}