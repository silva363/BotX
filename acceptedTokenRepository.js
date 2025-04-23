"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptedTokenRepository = void 0;
const db_1 = __importDefault(require("../utils/db"));
class AcceptedTokenRepository {
    async create(acceptedToken) {
        try {
            const sql = 'INSERT INTO accepted_tokens (name, symbol, address, decimals, pool_address, pool_name, pool_symbol, pool_decimals) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [
                acceptedToken.name,
                acceptedToken.symbol,
                acceptedToken.address,
                acceptedToken.decimals,
                acceptedToken.pool_address,
                acceptedToken.pool_name,
                acceptedToken.pool_symbol,
                acceptedToken.pool_decimals,
            ];
            await (0, db_1.default)(sql, values);
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error', err);
                throw err;
            }
        }
    }
    async update(acceptedToken) {
        try {
            const sql = 'UPDATE accepted_tokens SET name = ?, symbol = ?, address = ?, decimals = ?, pool_address = ?, pool_name = ?, pool_symbol = ?, pool_decimals = ?, updated_at = now() WHERE id = ?';
            const values = [
                acceptedToken.name,
                acceptedToken.symbol,
                acceptedToken.address,
                acceptedToken.decimals,
                acceptedToken.pool_address,
                acceptedToken.pool_name,
                acceptedToken.pool_symbol,
                acceptedToken.pool_decimals,
                acceptedToken.id
            ];
            await (0, db_1.default)(sql, values);
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error', err);
                throw err;
            }
        }
    }
    async changeActive(id, active) {
        try {
            const sql = 'UPDATE accepted_tokens SET active = ?, updated_at = now() WHERE id = ?';
            const values = [active, id];
            await (0, db_1.default)(sql, values);
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error', err);
                throw err;
            }
        }
    }
    async findByAddress(address) {
        try {
            const sql = 'SELECT * FROM accepted_tokens WHERE LOWER(address) = LOWER(?)';
            const values = [address];
            const tokenData = await (0, db_1.default)(sql, values);
            return tokenData[0];
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error', err);
                throw err;
            }
        }
    }
    async findBySymbol(symbol) {
        try {
            const sql = 'SELECT * FROM accepted_tokens WHERE symbol = ?';
            const values = [symbol];
            const tokenData = await (0, db_1.default)(sql, values);
            return tokenData[0];
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error', err);
                throw err;
            }
        }
    }
    async findById(id) {
        try {
            const sql = 'SELECT * FROM accepted_tokens WHERE id = ?';
            const values = [id];
            const tokenData = await (0, db_1.default)(sql, values);
            return tokenData[0];
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error', err);
                throw err;
            }
        }
    }
    async list() {
        try {
            const sql = `
      SELECT * FROM accepted_tokens ORDER BY id DESC`;
            const listTokens = await (0, db_1.default)(sql);
            return listTokens;
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error', err);
                throw err;
            }
        }
    }
}
exports.AcceptedTokenRepository = AcceptedTokenRepository;
//# sourceMappingURL=acceptedTokenRepository.js.map