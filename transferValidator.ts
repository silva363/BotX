
import { body } from 'express-validator';

export const onlyIdValidators = [
    body('id')
        .notEmpty().withMessage('Id is required')
        .isNumeric().withMessage('Id must be a number'),
];

export const onlyAddressIdValidators = [
    body('address_id')
        .notEmpty().withMessage('Address id is required')
        .isNumeric().withMessage('Address id must be a number'),
];