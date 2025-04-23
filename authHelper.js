"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("../utils/data");
const functionsHelper_1 = require("./functionsHelper");
const settings_1 = require("../utils/settings");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepository_1 = require("../repositories/userRepository");
class AuthHelper {
    async getSignMessage() {
        try {
            const timestamp = await (0, data_1.getTimestampOnChain)();
            const encrypted = (0, functionsHelper_1.encryptSignature)(JSON.stringify({ timestamp }));
            return ({ message: encrypted });
        }
        catch (e) {
            console.log(e);
            return ("An error ocurred");
        }
    }
    async getUserId(req) {
        const token = req.header("authtoken")?.replace(" ", "");
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, settings_1.settings.JWT_SECRET_KEY, async (err, decoded) => {
                if (err) {
                    reject(err);
                    return;
                }
                const signWallet = decoded.signWallet;
                const userRepository = new userRepository_1.UserRepository();
                const userData = await userRepository.findByWallet(signWallet);
                resolve(Number(userData.id));
            });
        });
    }
}
exports.default = AuthHelper;
//# sourceMappingURL=authHelper.js.map