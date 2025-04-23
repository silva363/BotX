"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiRouter_1 = __importDefault(require("./src/routes/apiRouter"));
const settings_1 = require("./src/utils/settings");
const systemService_1 = require("./src/services/system/systemService");
const mongodb_1 = __importDefault(require("./src/utils/mongodb"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', apiRouter_1.default);
async function startServer() {
    const port = settings_1.settings.PORT || 3000;
    // Connect to MongoDB if URI is provided
    if (settings_1.settings.MONGODB_URI) {
        try {
            await (0, mongodb_1.default)();
            console.log('Connected to MongoDB');
        }
        catch (error) {
            console.error('Failed to connect to MongoDB:', error);
        }
    }
    app.listen(port, () => {
        console.log(`Server running port ${port}`);
    });
    systemInitialize();
}
async function systemInitialize() {
    process.on("uncaughtException", (error) => {
        console.error("uncaughtException error", error);
    });
    process.on("unhandledRejection", (reason, promise) => {
        console.error("unhandledRejection error:", reason);
    });
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const systemService = new systemService_1.SystemService();
        await systemService.verifySeedBots();
        await systemService.verifyTradeBots();
        await systemService.verifyDistributionBots();
        await systemService.verifyVolumeBots();
        await systemService.verifySwaps();
        await systemService.verifyAirdrops();
    }
    catch (error) {
        console.log('system Initialize error', error);
    }
}
if (process.env.NODE_ENV !== 'test') {
    startServer().catch((err) => {
        console.error('Error starting the server:', err);
    });
}
exports.default = app;
//# sourceMappingURL=app.js.map