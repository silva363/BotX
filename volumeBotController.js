"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeBotController = void 0;
const express_validator_1 = require("express-validator");
const formatReturnData_1 = require("../helpers/formatReturnData");
const authHelper_1 = __importDefault(require("../helpers/authHelper"));
const volumeBotService_1 = require("../services/volumeBotService");
class VolumeBotController {
    constructor() {
        this.volumeBotService = new volumeBotService_1.VolumeBotService();
        this.authHelper = new authHelper_1.default();
    }
    async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { name, token_symbol, account_private_key_buy, private_key_buy_friendly_name, account_private_key_sell, private_key_sell_friendly_name, min_amount, max_amount, min_delay, max_delay, sell_swap_times, slippage_tolerance, delay_to_start, airdrop_time } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.volumeBotService.create(userId, name, token_symbol, account_private_key_buy, private_key_buy_friendly_name, account_private_key_sell, private_key_sell_friendly_name, Number(min_amount), Number(max_amount), Number(min_delay), Number(max_delay), Number(sell_swap_times), Number(slippage_tolerance), Number(delay_to_start), Number(airdrop_time));
            res.status(201).json({ message: 'Bot create success', data: [], success: true });
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
            const { uuid, name, token_symbol, account_private_key_buy, private_key_buy_friendly_name, account_private_key_sell, private_key_sell_friendly_name, min_amount, max_amount, min_delay, max_delay, sell_swap_times, slippage_tolerance, delay_to_start, airdrop_time } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.volumeBotService.edit(userId, uuid, name, token_symbol, account_private_key_buy, private_key_buy_friendly_name, account_private_key_sell, private_key_sell_friendly_name, Number(min_amount), Number(max_amount), Number(min_delay), Number(max_delay), Number(sell_swap_times), Number(slippage_tolerance), Number(delay_to_start), Number(airdrop_time));
            res.status(201).json({ message: 'Bot edit success', data: [], success: true });
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
            const data = await this.volumeBotService.list(userId);
            res.status(201).json({ message: 'Bot [list] success', success: true, data: (0, formatReturnData_1.format)(data) });
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
            const data = await this.volumeBotService.listHidden(userId);
            res.status(201).json({ message: 'Bot [listHidden] success', success: true, data: (0, formatReturnData_1.format)(data) });
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
            const data = await this.volumeBotService.find(userId, uuid);
            res.status(201).json({ message: 'Bot [find] success', success: true, data: (0, formatReturnData_1.format)(data) });
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
            const response = await this.volumeBotService.hideUnhide(userId, uuid);
            res.status(201).json({ message: `Bot is [${response}]`, data: [], success: true });
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
            await this.volumeBotService.run(Number(userId), uuid, true, true, 0);
            res.status(201).json({ message: 'Bot [volume] runing', data: [], success: true });
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
            const { uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.volumeBotService.stop(userId, uuid);
            res.status(201).json({ message: 'Bot [volume] stopped', data: [], success: true });
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
            const data = await this.volumeBotService.executions(Number(userId), uuid, Number(page), symbol, start_date, end_date);
            res.status(201).json({ message: 'Bot [executions] success', success: true, data: (0, formatReturnData_1.format)(data, false) });
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
            const data = await this.volumeBotService.transactions(Number(execution_id), Number(userId), uuid, Number(page), symbol, start_date, end_date);
            res.status(201).json({ message: 'Bot [transactions] success', success: true, data: (0, formatReturnData_1.format)(data, false) });
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
exports.VolumeBotController = VolumeBotController;
//# sourceMappingURL=volumeBotController.js.map