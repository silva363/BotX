
import { body } from 'express-validator';

export const createValidators = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 3, max: 100 }).withMessage('Name must have min 3 and max 100 characters'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 8, max: 40 }).withMessage('Passwordmust have min 8 and max 40 characters'),

    body('account_private_key')
        .notEmpty().withMessage('Account private key is required')
        .isString().withMessage('Account private key must be a string')
        .isLength({ min: 64, max: 66 }).withMessage('Account private key must have min 64 and max 66 characters'),

    body('token_symbol')
        .notEmpty().withMessage('Token symbol is required')
        .isString().withMessage('Token symbol must be a string')
        .isLength({ min: 3, max: 20 }).withMessage('Token symbol must have min 3 and max 20 characters'),

    body('wallets')
        .notEmpty().withMessage('Wallets is required')
        .isArray().withMessage('Wallets must be a array'),
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

    body('password')
        .notEmpty().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 8, max: 40 }).withMessage('Passwordmust have min 8 and max 40 characters'),

    body('token_symbol')
        .notEmpty().withMessage('Token symbol is required')
        .isString().withMessage('Token symbol must be a string')
        .isLength({ min: 3, max: 20 }).withMessage('Token symbol must have min 3 and max 20 characters'),

    body('wallets')
        .notEmpty().withMessage('Wallets is required')
        .isArray().withMessage('Wallets must be a array'),
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


export const playStopValidators = [
    body('uuid')
        .notEmpty().withMessage('Uuid is required')
        .isString().withMessage('Uuid must be a string')
        .isLength({ min: 36, max: 36 }).withMessage('Uuid must have 36 characters'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 8, max: 40 }).withMessage('Password must have min 8 and max 40 characters'),
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