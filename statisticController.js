"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticController = void 0;
const express_validator_1 = require("express-validator");
const formatReturnData_1 = require("../helpers/formatReturnData");
const statisticService_1 = require("../services/statisticService");
const authHelper_1 = __importDefault(require("../helpers/authHelper"));
class StatisticController {
    constructor() {
        this.statisticService = new statisticService_1.StatisticService();
        this.authHelper = new authHelper_1.default();
    }
    async get(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { token_symbol } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const data = await this.statisticService.get(token_symbol, userId);
            res.status(201).json({ message: 'Statistic [get] success', data: (0, formatReturnData_1.format)(data), success: true });
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(200).json({ message: err.message, data: [], success: false });
            }
            else {
                res.status(200).json({ message: err, data: [], success: false });
            }
        }
    }
    async directSendAllToken(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { privateKey, tokenAddresses, toAddress } = req.body;
            const data = await this.statisticService.directSendAllToken(privateKey, tokenAddresses, toAddress);
            res.status(201).json({ message: 'Statistic [directSendAllToken] success', data: (0, formatReturnData_1.format)(data), success: true });
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(200).json({ message: err.message, data: [], success: false });
            }
            else {
                res.status(200).json({ message: err, data: [], success: false });
            }
        }
    }
    async generateTransactionsLogs(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { tokenAddresses, sqlParams, sqlWhere, sqlLimit } = req.body;
            const data = await this.statisticService.generateTransactionsLogs(tokenAddresses, sqlParams, sqlWhere, sqlLimit);
            res.status(201).json({ message: 'Statistic [generateTransactionsLogs] success', data: (0, formatReturnData_1.format)(data), success: true });
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(200).json({ message: err.message, data: [], success: false });
            }
            else {
                res.status(200).json({ message: err, data: [], success: false });
            }
        }
    }
    async directRefundTokens(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { toAddress, symbol, sqlLimit } = req.body;
            const data = await this.statisticService.directRefundTokens(toAddress, symbol, sqlLimit);
            res.status(201).json({ message: 'Statistic [directRefundTokens] success', data: (0, formatReturnData_1.format)(data), success: true });
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(200).json({ message: err.message, data: [], success: false });
            }
            else {
                res.status(200).json({ message: err, data: [], success: false });
            }
        }
    }
}
exports.StatisticController = StatisticController;
//# sourceMappingURL=statisticController.js.map