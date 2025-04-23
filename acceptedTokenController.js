"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptedTokenController = void 0;
const express_validator_1 = require("express-validator");
const acceptedTokenService_1 = require("../services/acceptedTokenService");
const formatReturnData_1 = require("../helpers/formatReturnData");
class AcceptedTokenController {
    constructor() {
        this.acceptedTokenService = new acceptedTokenService_1.AcceptedTokenService();
    }
    async create(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { name, symbol, address, decimals, pool_address, pool_name, pool_symbol, pool_decimals } = req.body;
            await this.acceptedTokenService.create(name, symbol, address, Number(decimals), pool_address, pool_name, pool_symbol, Number(pool_decimals));
            res.status(201).json({ message: 'Token [create] success', data: [], success: true });
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
            const { id, name, symbol, address, decimals, pool_address, pool_name, pool_symbol, pool_decimals } = req.body;
            await this.acceptedTokenService.edit(Number(id), name, symbol, address, Number(decimals), pool_address, pool_name, pool_symbol, Number(pool_decimals));
            res.status(201).json({ message: 'Token [edit] success', data: [], success: true });
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
    async changeActive(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const { id } = req.body;
            const response = await this.acceptedTokenService.changeActive(Number(id));
            res.status(201).json({ message: `Token [${response}] success`, data: [], success: true });
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
            const {} = req.body;
            const data = await this.acceptedTokenService.list();
            res.status(201).json({ message: 'Token [list] success', success: true, data: (0, formatReturnData_1.format)(data) });
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
exports.AcceptedTokenController = AcceptedTokenController;
//# sourceMappingURL=acceptedTokenController.js.map