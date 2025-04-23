"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionBotController = void 0;
const express_validator_1 = require("express-validator");
const formatReturnData_1 = require("../helpers/formatReturnData");
const distributionBotService_1 = require("../services/distributionBotService");
const authHelper_1 = __importDefault(require("../helpers/authHelper"));
class DistributionBotController {
    constructor() {
        this.distributionBotService = new distributionBotService_1.DistributionBotService();
        this.authHelper = new authHelper_1.default();
    }
    async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { name, password, account_private_key, delay, token_symbol, wallets, account_friendly_name } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.distributionBotService.create(userId, name, password, account_private_key, Number(delay), token_symbol, wallets, account_friendly_name);
            res.status(201).json({ message: 'Distribution bot [create] success', data: [], success: true });
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
    async edit(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid, name, password, new_password, delay, token_symbol, wallets, account_friendly_name } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.distributionBotService.edit(userId, uuid, name, password, new_password, Number(delay), token_symbol, wallets, account_friendly_name);
            res.status(201).json({ message: 'Distribution bot [edit] success', data: [], success: true });
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
    async hideUnhide(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const response = await this.distributionBotService.hideUnhide(userId, uuid);
            res.status(201).json({ message: `Distribution bot is [${response}]`, data: [], success: true });
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
    async list(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const userId = await this.authHelper.getUserId(req);
            const data = await this.distributionBotService.list(userId);
            res.status(201).json({ message: 'Distribution bot [list] success', success: true, data: (0, formatReturnData_1.format)(data) });
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(200).json({ message: err.message, success: false, data: [] });
            }
            else {
                res.status(200).json({ message: err, success: false, data: [] });
            }
        }
    }
    async listHidden(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const userId = await this.authHelper.getUserId(req);
            const data = await this.distributionBotService.listHidden(userId);
            res.status(201).json({ message: 'Distribution bot [listHidden] success', success: true, data: (0, formatReturnData_1.format)(data) });
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
    async find(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const data = await this.distributionBotService.find(userId, uuid);
            res.status(201).json({ message: 'Distribution bot [find] success', success: true, data: (0, formatReturnData_1.format)(data) });
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(200).json({ message: err.message, success: false, data: [] });
            }
            else {
                res.status(200).json({ message: err, success: false, data: [] });
            }
        }
    }
    async play(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid, password } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.distributionBotService.run(userId, uuid, password, false, true);
            res.status(201).json({ message: 'Executing [distribution]', data: [], success: true });
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
    async stop(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid, password } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.distributionBotService.stop(userId, uuid, password);
            res.status(201).json({ message: 'Stopping [distribution]', data: [], success: true });
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
    async executions(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid, page, symbol, start_date, end_date } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const data = await this.distributionBotService.executions(Number(userId), uuid, Number(page), symbol, start_date, end_date);
            res.status(201).json({ message: 'Distribution bot [executions] success', success: true, data: (0, formatReturnData_1.format)(data, false) });
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(200).json({ message: err.message, success: false, data: [] });
            }
            else {
                res.status(200).json({ message: err, success: false, data: [] });
            }
        }
    }
    async reRun(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { execution_id, uuid, password } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.distributionBotService.reRun(Number(execution_id), Number(userId), uuid, password);
            res.status(201).json({ message: 'Distribution bot [re-run] success', success: true });
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(200).json({ message: err.message, success: false, data: [] });
            }
            else {
                res.status(200).json({ message: err, success: false, data: [] });
            }
        }
    }
    async transactions(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { execution_id, uuid, page, symbol, start_date, end_date } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const data = await this.distributionBotService.transactions(Number(execution_id), Number(userId), uuid, Number(page), symbol, start_date, end_date);
            res.status(201).json({ message: 'Distribution bot [transactions] success', success: true, data: (0, formatReturnData_1.format)(data, false) });
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(200).json({ message: err.message, success: false, data: [] });
            }
            else {
                res.status(200).json({ message: err, success: false, data: [] });
            }
        }
    }
}
exports.DistributionBotController = DistributionBotController;
//# sourceMappingURL=distributionBotController.js.map