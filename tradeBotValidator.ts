
import { body } from 'express-validator';

export const create = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 3, max: 100 }).withMessage('Name must have min 3 and max 100 characters'),

    body('helper_private_key')
        .notEmpty().withMessage('Helper private key is required')
        .isString().withMessage('Helper private key must be a string')
        .isLength({ min: 64, max: 66 }).withMessage('Helper private key must have min 64 and max 66 characters'),

    body('account_private_key')
        .notEmpty().withMessage('Account private key is required')
        .isString().withMessage('Account private key must be a string')
        .isLength({ min: 64, max: 66 }).withMessage('Account private key must have min 64 and max 66 characters'),

    body('destiny_address')
        .notEmpty().withMessage('Destiny address is required')
        .isString().withMessage('Destiny address must be a string')
        .isLength({ min: 42, max: 42 }).withMessage('Destiny address must have 42 characters'),

    body('token_symbol')
        .notEmpty().withMessage('Token symbol is required')
        .isString().withMessage('Token symbol must be a string')
        .isLength({ min: 3, max: 20 }).withMessage('Token symbol must have min 3 and max 20 characters'),

    body('target_price')
        .notEmpty().withMessage('Target price is required')
        .isNumeric().withMessage('Target price must be a number'),

    body('min_amount')
        .notEmpty().withMessage('Min amount is required')
        .isNumeric().withMessage('Min amount must be a number'),

    body('max_amount')
        .notEmpty().withMessage('Max amount is required')
        .isNumeric().withMessage('Max amount must be a number'),

    body('min_delay')
        .notEmpty().withMessage('Min delay is required')
        .isNumeric().withMessage('Min delay must be a number'),

    body('max_delay')
        .notEmpty().withMessage('Max delay is required')
        .isNumeric().withMessage('Max delay must be a number'),

    body('target_balance')
        .notEmpty().withMessage('Target balance is required')
        .isNumeric().withMessage('Target balance must be a number'),

    body('holder_percent')
        .notEmpty().withMessage('Holder percent is required')
        .isNumeric().withMessage('Holder percent must be a number'),

    body('slippage_tolerance')
        .notEmpty().withMessage('Slippage tolerance is required')
        .isNumeric().withMessage('Slippage tolerance must be a number'),

    body('delay_to_start')
        .notEmpty().withMessage('Delay to start is required')
        .isNumeric().withMessage('Delay to start must be a number'),

    body('strategy')
        .notEmpty().withMessage('Strategy is required')
        .isString().withMessage('Strategy must be a string')
        .isLength({ min: 3, max: 4 }).withMessage('Strategy must be "buy" or "sell"'),

    body('cycles')
        .notEmpty().withMessage('Cycles is required')
        .isNumeric().withMessage('Cycles must be a number'),

    body('cycle_delay')
        .notEmpty().withMessage('Cycle delay is required')
        .isNumeric().withMessage('Cycle delay must be a number'),

    body('cycle_ghosts')
        .notEmpty().withMessage('Cycle ghosts is required')
        .isNumeric().withMessage('Cycle ghosts must be a number'),

    body('work_start')
        .notEmpty().withMessage('Work start is required')
        .isString().withMessage('Work start must be a string')
        .isLength({ min: 5, max: 5 }).withMessage('Work start must have 5 characters"'),

    body('work_end')
        .notEmpty().withMessage('Work end is required')
        .isString().withMessage('Work end must be a string')
        .isLength({ min: 5, max: 5 }).withMessage('Work end must have 5 characters"'),

    body('airdrop_time')
        .notEmpty().withMessage('Airdrop time is required')
        .isNumeric().withMessage('Airdrop time must be a number'),
];

export const edit = [
    body('uuid')
        .notEmpty().withMessage('Uuid is required')
        .isString().withMessage('Uuid must be a string')
        .isLength({ min: 36, max: 36 }).withMessage('Uuid must have 36 characters'),

    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 3, max: 100 }).withMessage('Name must have min 3 and max 100 characters'),

    body('destiny_address')
        .notEmpty().withMessage('Destiny address is required')
        .isString().withMessage('Destiny address must be a string')
        .isLength({ min: 42, max: 42 }).withMessage('Destiny address must have 42 characters'),

    body('token_symbol')
        .notEmpty().withMessage('Token symbol is required')
        .isString().withMessage('Token symbol must be a string')
        .isLength({ min: 3, max: 20 }).withMessage('Token symbol must have min 3 and max 20 characters'),

    body('target_price')
        .notEmpty().withMessage('Target price is required')
        .isNumeric().withMessage('Target price must be a number'),

    body('min_amount')
        .notEmpty().withMessage('Min amount is required')
        .isNumeric().withMessage('Min amount must be a number'),

    body('max_amount')
        .notEmpty().withMessage('Max amount is required')
        .isNumeric().withMessage('Max amount must be a number'),

    body('min_delay')
        .notEmpty().withMessage('Min delay is required')
        .isNumeric().withMessage('Min delay must be a number'),

    body('max_delay')
        .notEmpty().withMessage('Max delay is required')
        .isNumeric().withMessage('Max delay must be a number'),

    body('target_balance')
        .notEmpty().withMessage('Target balance is required')
        .isNumeric().withMessage('Target balance must be a number'),

    body('holder_percent')
        .notEmpty().withMessage('Holder percent is required')
        .isNumeric().withMessage('Holder percent must be a number'),

    body('slippage_tolerance')
        .notEmpty().withMessage('Slippage tolerance is required')
        .isNumeric().withMessage('Slippage tolerance must be a number'),

    body('delay_to_start')
        .notEmpty().withMessage('Delay to start is required')
        .isNumeric().withMessage('Delay to start must be a number'),

    body('cycles')
        .notEmpty().withMessage('Cycles is required')
        .isNumeric().withMessage('Cycles must be a number'),

    body('cycle_delay')
        .notEmpty().withMessage('Cycle delay is required')
        .isNumeric().withMessage('Cycle delay must be a number'),

    body('cycle_ghosts')
        .notEmpty().withMessage('Cycle ghosts is required')
        .isNumeric().withMessage('Cycle ghosts must be a number'),

    body('work_start')
        .notEmpty().withMessage('Work start is required')
        .isString().withMessage('Work start must be a string')
        .isLength({ min: 5, max: 5 }).withMessage('Work start must have 5 characters"'),

    body('work_end')
        .notEmpty().withMessage('Work end is required')
        .isString().withMessage('Work end must be a string')
        .isLength({ min: 5, max: 5 }).withMessage('Work end must have 5 characters"'),

    body('airdrop_time')
        .notEmpty().withMessage('Airdrop time is required')
        .isNumeric().withMessage('Airdrop time must be a number'),
];

export const onlyId = [
    body('id')
        .notEmpty().withMessage('Id is required')
        .isNumeric().withMessage('Id must be a number'),
];

export const onlyUuid = [
    body('uuid')
        .notEmpty().withMessage('Uuid is required')
        .isString().withMessage('Uuid must be a string')
        .isLength({ min: 36, max: 36 }).withMessage('Uuid must have 36 characters'),
];

export const uuidPage = [
    body('uuid')
        .notEmpty().withMessage('Uuid is required')
        .isString().withMessage('Uuid must be a string')
        .isLength({ min: 36, max: 36 }).withMessage('Uuid must have 36 characters'),

    body('page')
        .notEmpty().withMessage('Page is required')
        .isNumeric().withMessage('Page must be a number'),
];

export const uuidPageExecId = [
    body('execution_id')
        .notEmpty().withMessage('Execution id is required')
        .isNumeric().withMessage('Execution id must be a number'),

    body('uuid')
        .notEmpty().withMessage('Uuid is required')
        .isString().withMessage('Uuid must be a string')
        .isLength({ min: 36, max: 36 }).withMessage('Uuid must have 36 characters'),

    body('page')
        .notEmpty().withMessage('Page is required')
        .isNumeric().withMessage('Page must be a number'),
];

export const uuidExecId = [
    body('execution_id')
        .notEmpty().withMessage('Execution id is required')
        .isNumeric().withMessage('Execution id must be a number'),

    body('uuid')
        .notEmpty().withMessage('Uuid is required')
        .isString().withMessage('Uuid must be a string')
        .isLength({ min: 36, max: 36 }).withMessage('Uuid must have 36 characters'),
];