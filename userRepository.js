"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUserRepository = void 0;
const User_1 = __importDefault(require("../../models/mongodb/User"));
const mongodb_1 = __importDefault(require("../../utils/mongodb"));
class MongoUserRepository {
    async findByWallet(wallet) {
        try {
            await (0, mongodb_1.default)();
            const user = await User_1.default.findOne({ wallet_address: wallet });
            return user;
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('MongoDB error', err.message);
                throw err.message;
            }
            else {
                console.log('MongoDB error', err);
                throw err;
            }
        }
    }
    async createUser(walletAddress) {
        try {
            await (0, mongodb_1.default)();
            const user = new User_1.default({
                wallet_address: walletAddress
            });
            await user.save();
            return user;
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('MongoDB error', err.message);
                throw err.message;
            }
            else {
                console.log('MongoDB error', err);
                throw err;
            }
        }
    }
}
exports.MongoUserRepository = MongoUserRepository;
//# sourceMappingURL=userRepository.js.map