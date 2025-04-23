
import { body } from 'express-validator';

export const createValidators = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 3, max: 100 }).withMessage('Name must have min 3 and max 100 characters'),

    body('token_symbol')
        .notEmpty().withMessage('Token symbol is required')
        .isString().withMessage('Token symbol must be a string')
        .isLength({ min: 3, max: 20 }).withMessage('Token symbol must have min 3 and max 20 characters'),

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

    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isNumeric().withMessage('Amount must be a number'),

    body('cycles')
        .notEmpty().withMessage('Cycles is required')
        .isNumeric().withMessage('Cycles must be a number'),

    body('cycle_ghosts')
        .notEmpty().withMessage('Cycle ghosts wallets is required')
        .isNumeric().withMessage('Cycle ghosts wallets must be a number'),

    body('cycle_delay')
        .notEmpty().withMessage('Cycle delay is required')
        .isNumeric().withMessage('Cycle delay must be a number'),

    body('airdrop_time')
        .notEmpty().withMessage('Airdrop time is required')
        .isNumeric().withMessage('Airdrop time must be a number')
];

export const editValidators = [
    body('uuid')
        .notEmpty().withMessage('Uuid is required')
        .isString().withMessage('Uuid must be a string')
        .isLength({ min: 36, max: 36 }).withMessage('Uuid must have 36 characters'),

    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 3, max: 100 }).withMessage('Name must have min 3 and max 100 characters'),

    body('token_symbol')
        .notEmpty().withMessage('Token symbol is required')
        .isString().withMessage('Token symbol must be a string')
        .isLength({ min: 3, max: 20 }).withMessage('Token symbol must have min 3 and max 20 characters'),

    body('destiny_address')
        .notEmpty().withMessage('Destiny address is required')
        .isString().withMessage('Destiny address must be a string')
        .isLength({ min: 42, max: 42 }).withMessage('Destiny address must have 42 characters'),

    body('amount')
        .notEmpty().withMessage('Max amount is required')
        .isNumeric().withMessage('Max amount must be a number'),

    body('cycle_ghosts')
        .notEmpty().withMessage('Cycle ghosts wallets is required')
        .isNumeric().withMessage('Cycle ghosts wallets must be a number'),

    body('cycle_delay')
        .notEmpty().withMessage('Cycle delay is required')
        .isNumeric().withMessage('Cycle delay must be a number'),

    body('airdrop_time')
        .notEmpty().withMessage('Airdrop time is required')
        .isNumeric().withMessage('Airdrop time must be a number')
];

export const onlyIdValidators = [
    body('id')
        .notEmpty().withMessage('Id is required')
        .isNumeric().withMessage('Id must be a number'),
];

export const onlyUuidValidators = [
    body('uuid')
        .notEmpty().withMessage('Uuid is required')
        .isString().withMessage('Uuid must be a string')
        .isLength({ min: 36, max: 36 }).withMessage('Uuid must have 36 characters'),
];

export const uuidPageValidators = [
    body('uuid')
        .notEmpty().withMessage('Uuid is required')
        .isString().withMessage('Uuid must be a string')
        .isLength({ min: 36, max: 36 }).withMessage('Uuid must have 36 characters'),

    body('page')
        .notEmpty().withMessage('Page is required')
        .isNumeric().withMessage('Page must be a number'),
];

export const uuidPageExecIdValidators = [
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

export const uuidExecIdValidators = [
    body('execution_id')
        .notEmpty().withMessage('Execution id is required')
        .isNumeric().withMessage('Execution id must be a number'),

    body('uuid')
        .notEmpty().withMessage('Uuid is required')
        .isString().withMessage('Uuid must be a string')
        .isLength({ min: 36, max: 36 }).withMessage('Uuid must have 36 characters'),
];
