
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

    body('account_private_key_buy')
        .notEmpty().withMessage('Account private buy key is required')
        .isString().withMessage('Account private buy key must be a string')
        .isLength({ min: 64, max: 66 }).withMessage('Account private buy key must have min 64 and max 66 characters'),

    body('account_private_key_sell')
        .notEmpty().withMessage('Account private key sell is required')
        .isString().withMessage('Account private key sell must be a string')
        .isLength({ min: 64, max: 66 }).withMessage('Account private key sell must have min 64 and max 66 characters'),

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
        .isNumeric().withMessage('Max delay must be a number')
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
        .isNumeric().withMessage('Max delay must be a number')
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

export const idPageValidators = [
    body('id')
        .notEmpty().withMessage('Id is required')
        .isNumeric().withMessage('Id must be a number'),

    body('page')
        .notEmpty().withMessage('Page is required')
        .isNumeric().withMessage('Page must be a number'),
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