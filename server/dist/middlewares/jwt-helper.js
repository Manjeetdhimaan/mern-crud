"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../utils/response");
class JwtHelper {
    constructor() {
        this.JWT_SECRET = String(process.env.JWT_SECRET);
        // Bearer token
        this.verifyJwtToken = async (req, res, next) => {
            let token;
            if (req && req.headers && 'authorization' in req.headers && req.headers['authorization'])
                token = req.headers['authorization'].split(' ')[1];
            if (!token)
                return res.status(403).send((0, response_1.failAction)('No token provided.', 403));
            else {
                try {
                    const decoded = await this.verifyJwtAsync(token, this.JWT_SECRET);
                    req._id = String(decoded._id);
                    req._email = String(decoded._email);
                    req._userRole = decoded._userRole;
                    next();
                }
                catch (err) {
                    return res.status(500).send((0, response_1.failAction)('Token authentication failed.', 500));
                }
            }
        };
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
    verifyJwtAsync(token, secret) {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
                if (err)
                    return reject(err);
                resolve(decoded);
            });
        });
    }
    async generateJwt(_id, _email, _userRole, isAdmin = false, remeberMe = false) {
        return jsonwebtoken_1.default.sign({
            _id,
            _email,
            isAdmin,
            _userRole
        }, this.JWT_SECRET, {
            expiresIn: remeberMe ? '365d' : process.env.JWT_EXP
        });
    }
}
exports.default = JwtHelper;
// export { verifyJwtToken, isAdmin };
