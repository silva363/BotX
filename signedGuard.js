"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signedGuard = void 0;
const userRepository_1 = require("../repositories/userRepository");
const settings_1 = require("../utils/settings");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function signedGuard(req, res, next) {
    const token = req.header("authtoken")?.replace(" ", "");
    try {
        if (token === undefined || !token) {
            return res.status(401).json({ message: 'Jwt token not provided' });
        }
        jsonwebtoken_1.default.verify(token, settings_1.settings.JWT_SECRET_KEY, async (err, decoded) => {
            if (err) {
                console.log('signedGuard', err.message);
                return res.status(401).json({ message: `Jwt token ${err.message}` });
            }
            else if (decoded !== undefined && decoded.signWallet) {
                const signWallet = decoded.signWallet;
                const userRepository = new userRepository_1.UserRepository();
                const userData = await userRepository.findByWallet(signWallet);
                if (!userData) {
                    return res.status(401).json({ message: 'Your wallet cant access the system' });
                }
                next();
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(401).json({ message: error.message });
        }
        return res.status(401).json({ message: 'Try again later' });
    }
}
exports.signedGuard = signedGuard;
//# sourceMappingURL=signedGuard.js.map