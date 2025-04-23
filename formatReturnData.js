"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = void 0;
const settings_1 = require("../utils/settings");
const date_fns_1 = require("date-fns");
function format(data, hidePrivateKey = true) {
    try {
        if (Array.isArray(data)) {
            data.forEach(element => {
                element = formatData(element, hidePrivateKey);
            });
        }
        else {
            data = formatData(data, hidePrivateKey);
            if (data.details) {
                const details = formatData(data.details, hidePrivateKey);
                data.details = details;
            }
            if (data.transactions && Array.isArray(data.transactions)) {
                const transactions = [];
                data.transactions.forEach((element) => {
                    element = formatData(element, hidePrivateKey);
                    transactions.push(element);
                });
                data.transactions = transactions;
            }
            data = data;
        }
        return data;
    }
    catch (error) {
        console.log('format error', error);
        throw error;
    }
}
exports.format = format;
function formatData(data, hidePrivateKey) {
    if (hidePrivateKey || data?.account_private_key) {
        data.account_private_key = '';
    }
    if (hidePrivateKey || data?.helper_private_key) {
        data.helper_private_key = '';
    }
    if (data?.account_private_key_buy) {
        data.account_private_key_buy = '';
    }
    if (data?.account_private_key_sell) {
        data.account_private_key_sell = '';
    }
    if (data.password) {
        data.password = '';
    }
    if (data.min_amount) {
        data.min_amount = formatNumber(data.min_amount);
    }
    if (data.max_amount) {
        data.max_amount = formatNumber(data.max_amount);
    }
    if (data.target_balance) {
        data.target_balance = formatNumber(data.target_balance);
    }
    if (data.start_matic) {
        data.start_matic = formatNumber(data.start_matic);
    }
    if (data.end_matic) {
        data.end_matic = formatNumber(data.end_matic);
    }
    if (data.now_matic) {
        data.now_matic = formatNumber(data.now_matic);
    }
    if (data.start_selected_token) {
        data.start_selected_token = formatNumber(data.start_selected_token);
    }
    if (data.end_selected_token) {
        data.end_selected_token = formatNumber(data.end_selected_token);
    }
    if (data.now_selected_token) {
        data.now_selected_token = formatNumber(data.now_selected_token);
    }
    if (data.target_price) {
        data.target_price = Number(data.target_price).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    }
    if (data.total_selected_token) {
        data.total_selected_token = formatNumber(data.total_selected_token);
    }
    if (data.total_matic) {
        data.total_matic = formatNumber(data.total_matic);
    }
    if (data.matic_output) {
        data.matic_output = formatNumber(data.matic_output);
    }
    if (data.selected_token_output) {
        data.selected_token_output = formatNumber(data.selected_token_output);
    }
    if (data.matic_input) {
        data.matic_input = formatNumber(data.matic_input);
    }
    if (data.selected_token_input) {
        data.selected_token_input = formatNumber(data.selected_token_input);
    }
    if (data.matic_pending) {
        data.matic_pending = formatNumber(data.matic_pending);
    }
    if (data.matic_success) {
        data.matic_success = formatNumber(data.matic_success);
    }
    if (data.matic_fails) {
        data.matic_fails = formatNumber(data.matic_fails);
    }
    if (data.selected_token_pending) {
        data.selected_token_pending = formatNumber(data.selected_token_pending);
    }
    if (data.selected_token_fails) {
        data.selected_token_fails = formatNumber(data.selected_token_fails);
    }
    if (data.selected_token_success) {
        data.selected_token_success = formatNumber(data.selected_token_success);
    }
    if (data.spent_balance) {
        data.spent_balance = formatNumber(data.spent_balance);
    }
    if (data.success_rate) {
        data.success_rate = data.success_rate + "%";
    }
    if (data.result) {
        data.result = "";
    }
    if (data.created_at) {
        data.created_at = addTimeOnDate(data.created_at);
    }
    if (data.updated_at) {
        data.updated_at = addTimeOnDate(data.updated_at);
    }
    return data;
}
function formatNumber(value) {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue.toFixed(5);
}
function addTimeOnDate(dateString) {
    try {
        if (settings_1.settings.WORKSPACE != 'local') {
            const date = new Date(dateString);
            const newDate = (0, date_fns_1.addHours)(date, -5);
            const formatedDate = (0, date_fns_1.format)(newDate, "dd/MM/yyyy HH:mm");
            return formatedDate;
        }
        else {
            return dateString;
        }
    }
    catch (error) {
        console.log('addTimeOnDate dateString', dateString);
        console.log('addTimeOnDate error', error);
        return dateString;
    }
}
//# sourceMappingURL=formatReturnData.js.map