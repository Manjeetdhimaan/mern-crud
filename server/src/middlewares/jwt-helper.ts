import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import { failAction } from "../utils/response";
import { IRequest } from "../types/common.types";
import { IRole } from "../types/role.types";

export default class JwtHelper {
    private JWT_SECRET = String(process.env.JWT_SECRET);

    private verifyJwtAsync(token: string, secret: string): Promise<jwt.JwtPayload | string> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) return reject(err);
                resolve(decoded as jwt.JwtPayload);
            });
        });
    }
    // Bearer token
    verifyJwtToken = async (req: IRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        let token;
        if (req && req.headers && 'authorization' in req.headers && req.headers['authorization'])
            token = req.headers['authorization'].split(' ')[1];
        if (!token)
            return res.status(403).send(failAction('No token provided.', 403));
        else {
            try {
                const decoded = await this.verifyJwtAsync(token, this.JWT_SECRET) as IRequest;
                (req as IRequest)._id = String(decoded._id);
                (req as IRequest)._email = String(decoded._email);
                (req as IRequest)._userRole = decoded._userRole;
                next();
            } catch (err) {
                return res.status(401).send(failAction('Token authentication failed.', 401));
            }
        }
    }

    async generateJwt(_id: number, _email: string, _userRole?: IRole, isAdmin = false, remeberMe = false): Promise<string> {
        return jwt.sign({
            _id,
            _email,
            isAdmin,
            _userRole
        }, this.JWT_SECRET, {
            expiresIn: remeberMe ? '365d' : process.env.JWT_EXP || '1h'
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