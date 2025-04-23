"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = void 0;
const settings_1 = require("../utils/settings");
function authGuard(req, res, next) {
    const token = req.header("authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ message: "Authentication token not provided" });
    }
    try {
        const secretKey = settings_1.settings.API_SECRET_KEY || "";
        if (secretKey != token) {
            return res.status(401).json({ message: "Invalid access token" });
        }
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(401).json({ message: error.message });
        }
        return res.status(401).json({ message: 'Try again later' });
    }
}
exports.authGuard = authGuard;
//# sourceMappingURL=authGuard.js.map