import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { failAction } from "../utils/response";


export interface IRequest extends Request {
    _id: string,
    _email: string
}

export default class JwtHelper {
    util = require('util');
    verifyJwtAsync = this.util.promisify(jwt.verify);
    JWT_SECRET = process.env.JWT_SECRET as string;

    verifyJwtToken = async (req: IRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        let token;
        if (req && req.headers && 'authorization' in req.headers && req.headers['authorization'])
            token = req.headers['authorization'].split(' ')[1];
        if (!token)
            return res.status(403).send(failAction('No token provided.', 403));
        else {
            try {
                const decoded = await this.verifyJwtAsync(token, this.JWT_SECRET);
                req._id = decoded._id;
                req._email = decoded._email;
                next();
            } catch (err) {
                return res.status(500).send(failAction('Token authentication failed.', 500));
            }
        }
    }

    async generateJwt(_id: number, _email: string, isAdmin = false, remeberMe = false): Promise<string> {
        return jwt.sign({
            _id,
            _email,
            isAdmin
        }, this.JWT_SECRET, {
            expiresIn: remeberMe ? '365d' : process.env.JWT_EXP
        });
    }

    // async isAdmin(req: IRequest, res: Response, next: NextFunction): Promise<void | Response> {
    //     try {
    //         const user = await User.findOne({ _id: req._id }).lean();
    //         if (!user) {
    //             return res.status(404).send(failAction('Not Authorized!', 404));
    //         } else if (!user.isAdmin) {
    //             return res.status(401).send(failAction('Not Authorized!', 401));
    //         } else {
    //             next();
    //         }
    //     } catch (err) {
    //         return res.status(500).send(failAction((err as Error).message || 'Internal Server Error', 500));
    //     }
    // };
}

// export { verifyJwtToken, isAdmin };