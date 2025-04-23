
import { body } from 'express-validator';

export const createValidator = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 3, max: 100 }).withMessage('Name must have min 3 and max 100 characters'),

    body('symbol')
        .notEmpty().withMessage('Symbol is required')
        .isString().withMessage('Symbol must be a string')
        .isLength({ min: 3, max: 20 }).withMessage('Symbol must have min 3 and max 20 characters'),

    body('address')
        .notEmpty().withMessage('Address is required')
        .isString().withMessage('Address must be a string')
        .isLength({ min: 42, max: 42 }).withMessage('Address must have 42 characters'),
];

export const editValidator = [
    body('id')
        .notEmpty().withMessage('Id is required')
        .isNumeric().withMessage('Id must be a number'),

    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 3, max: 100 }).withMessage('Name must have min 3 and max 100 characters'),

    body('symbol')
        .notEmpty().withMessage('Symbol is required')
        .isString().withMessage('Symbol must be a string')
        .isLength({ min: 3, max: 20 }).withMessage('Symbol must have min 3 and max 20 characters'),

    body('address')
        .notEmpty().withMessage('Address is required')
        .isString().withMessage('Address must be a string')
        .isLength({ min: 42, max: 42 }).withMessage('Address must have 42 characters'),
];

export const onlyIdValidator = [
    body('id')
        .notEmpty().withMessage('Id is required')
        .isNumeric().withMessage('Id must be a number'),
];