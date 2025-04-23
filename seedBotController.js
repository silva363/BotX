"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedBotController = void 0;
const express_validator_1 = require("express-validator");
const seedBotService_1 = require("../services/seedBotService");
const formatReturnData_1 = require("../helpers/formatReturnData");
const authHelper_1 = __importDefault(require("../helpers/authHelper"));
class SeedBotController {
    constructor() {
        this.seedBotService = new seedBotService_1.SeedBotService();
        this.authHelper = new authHelper_1.default();
    }
    async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { name, helper_private_key, account_private_key, account_friendly_name, destiny_address, destiny_friendly_name, token_symbol, amount, cycles, cycle_delay, cycle_ghosts, airdrop_time, } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.seedBotService.create(userId, name, helper_private_key, account_private_key, account_friendly_name, destiny_address, destiny_friendly_name, token_symbol, Number(amount), Number(cycles), Number(cycle_delay), Number(cycle_ghosts), Number(airdrop_time));
            res.status(201).json({ message: 'Seed bot create success', data: [], success: true });
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
            const { uuid, name, token_symbol, account_private_key, destiny_address, account_friendly_name, destiny_friendly_name, amount, cycles, cycle_delay, cycle_ghosts, airdrop_time, } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.seedBotService.edit(userId, uuid, name, account_private_key, account_friendly_name, destiny_address, destiny_friendly_name, token_symbol, Number(amount), Number(cycles), Number(cycle_delay), Number(cycle_ghosts), Number(airdrop_time));
            res.status(201).json({ message: 'Seed bot edit success', data: [], success: true });
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
            const { type } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const data = await this.seedBotService.list(userId);
            res.status(201).json({ message: 'Seed bot [list] success', success: true, data: (0, formatReturnData_1.format)(data) });
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
            const { type } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const data = await this.seedBotService.listHidden(userId);
            res.status(201).json({ message: 'Seed bot [listHidden] success', success: true, data: (0, formatReturnData_1.format)(data) });
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
    async find(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const data = await this.seedBotService.find(userId, uuid);
            res.status(201).json({ message: 'Seed bot [find] success', success: true, data: (0, formatReturnData_1.format)(data) });
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
    async hideUnhide(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const response = await this.seedBotService.hideUnhide(userId, uuid);
            res.status(201).json({ message: `Seed bot is [${response}]`, data: [], success: true });
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
    async run(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.seedBotService.run(Number(userId), uuid, true);
            res.status(201).json({ message: 'Seed bot runing', data: [], success: true });
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
            const data = await this.seedBotService.executions(Number(userId), uuid, Number(page), symbol, start_date, end_date);
            res.status(201).json({ message: 'Seed bot [executions] success', success: true, data: (0, formatReturnData_1.format)(data, false) });
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
            const { execution_id, uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.seedBotService.reRun(Number(execution_id), Number(userId), uuid);
            res.status(201).json({ message: 'Seed bot [re-run] success', success: true });
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
            const data = await this.seedBotService.transactions(Number(execution_id), Number(userId), uuid, Number(page), symbol, start_date, end_date);
            res.status(201).json({ message: 'Seed bot [transactions] success', success: true, data: (0, formatReturnData_1.format)(data, false) });
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
exports.SeedBotController = SeedBotController;
//# sourceMappingURL=seedBotController.js.map