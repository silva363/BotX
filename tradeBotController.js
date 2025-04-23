"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeBotController = void 0;
const express_validator_1 = require("express-validator");
const tradeBotService_1 = require("../services/tradeBotService");
const tradeBotSellService_1 = require("../services/tradeBotSellService");
const formatReturnData_1 = require("../helpers/formatReturnData");
const authHelper_1 = __importDefault(require("../helpers/authHelper"));
const tradeBotBuyService_1 = require("../services/tradeBotBuyService");
class TradeBotController {
    constructor() {
        this.tradeBotService = new tradeBotService_1.TradeBotService();
        this.tradeBotSellService = new tradeBotSellService_1.TradeBotSellService();
        this.tradeBotBuyService = new tradeBotBuyService_1.TradeBotBuyService();
        this.authHelper = new authHelper_1.default();
    }
    async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { name, helper_private_key, account_private_key, account_friendly_name, destiny_address, destiny_friendly_name, token_symbol, target_price, min_amount, max_amount, min_delay, max_delay, target_balance, holder_percent, slippage_tolerance, delay_to_start, strategy, cycles, cycle_delay, cycle_ghosts, work_start, work_end, airdrop_time, mode, max_queue } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.tradeBotService.create(userId, name, helper_private_key, account_private_key, account_friendly_name, destiny_address, destiny_friendly_name, token_symbol, Number(target_price), Number(min_amount), Number(max_amount), Number(min_delay), Number(max_delay), Number(target_balance), Number(holder_percent), Number(slippage_tolerance), Number(delay_to_start), strategy, Number(cycles), Number(cycle_delay), Number(cycle_ghosts), work_start, work_end, Number(airdrop_time), mode, Number(max_queue));
            res.status(201).json({ message: 'Trade bot create success', data: [], success: true });
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
            const { uuid, name, account_friendly_name, destiny_address, destiny_friendly_name, token_symbol, target_price, min_amount, max_amount, min_delay, max_delay, target_balance, holder_percent, slippage_tolerance, delay_to_start, cycles, cycle_delay, cycle_ghosts, work_start, work_end, airdrop_time, mode, max_queue } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.tradeBotService.edit(userId, uuid, name, account_friendly_name, destiny_address, destiny_friendly_name, token_symbol, Number(target_price), Number(min_amount), Number(max_amount), Number(min_delay), Number(max_delay), Number(target_balance), Number(holder_percent), Number(slippage_tolerance), Number(delay_to_start), Number(cycles), Number(cycle_delay), Number(cycle_ghosts), work_start, work_end, Number(airdrop_time), mode, Number(max_queue));
            res.status(201).json({ message: 'Trade Bot edit success', data: [], success: true });
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
            const { strategy, is_hidden } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const data = await this.tradeBotService.list(userId, strategy, is_hidden);
            res.status(201).json({ message: 'Trade Bot [list] success', success: true, data: (0, formatReturnData_1.format)(data) });
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
            const { strategy } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const data = await this.tradeBotService.listHidden(userId, strategy);
            res.status(201).json({ message: 'Trade Bot [listHidden] success', success: true, data: (0, formatReturnData_1.format)(data) });
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
            const data = await this.tradeBotService.find(userId, uuid);
            res.status(201).json({ message: 'Trade Bot [find] success', success: true, data: (0, formatReturnData_1.format)(data) });
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
            const response = await this.tradeBotService.hideUnhide(userId, uuid);
            res.status(201).json({ message: `Trade Bot is [${response}]`, data: [], success: true });
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
    async runBuy(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.tradeBotBuyService.run(Number(userId), uuid, true, true, 0);
            res.status(201).json({ message: 'Trade Bot [buy] is running', data: [], success: true });
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
    async stopBuy(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.tradeBotBuyService.stop(userId, uuid);
            res.status(201).json({ message: 'Trade Bot [buy] stopped', data: [], success: true });
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
    async runSell(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const response = await this.tradeBotSellService.run(userId, uuid, true, true, 0);
            res.status(201).json({ message: response, data: [], success: true });
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
    async stopSell(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.tradeBotSellService.stop(userId, uuid);
            res.status(201).json({ message: 'Trade Bot [sell] stopped', data: [], success: true });
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
    async reRun(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { execution_id, uuid, flow_id } = req.body;
            const userId = await this.authHelper.getUserId(req);
            //await this.tradeBotService.reRun(Number(execution_id), Number(userId), uuid, Number(flow_id));
            res.status(201).json({ message: 'Trade bot [re-run] in development', success: true });
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
    async doAllAirdrops(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid, execution_id } = req.body;
            const userId = await this.authHelper.getUserId(req);
            await this.tradeBotService.doAllAirdrops(userId, uuid, Number(execution_id));
            res.status(201).json({ message: 'Airdrop executing', data: [], success: true });
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
            const data = await this.tradeBotService.executions(Number(userId), uuid, Number(page), symbol, start_date, end_date);
            res.status(201).json({ message: 'Trade Bot [executions] success', success: true, data: (0, formatReturnData_1.format)(data, false) });
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
            const data = await this.tradeBotService.transactions(Number(execution_id), Number(userId), uuid, Number(page), symbol, start_date, end_date);
            res.status(201).json({ message: 'Trade Bot [transactions] success', success: true, data: (0, formatReturnData_1.format)(data, false) });
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
    async queueSwaps(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { uuid } = req.body;
            const userId = await this.authHelper.getUserId(req);
            const data = await this.tradeBotService.queueSwaps(Number(userId), uuid);
            res.status(201).json({ message: 'Trade Bot [queueSwaps] success', success: true, data: (0, formatReturnData_1.format)(data, false) });
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
exports.TradeBotController = TradeBotController;
//# sourceMappingURL=tradeBotController.js.map