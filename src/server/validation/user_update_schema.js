const BaseJoi = require('joi');
const JoiCountryExtension = require('joi-country-extension');
const Joi = BaseJoi.extend(JoiCountryExtension);

module.exports = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        name: Joi.string().regex(/^[A-z]+$/, { name: 'alpha' }).max(15).required(),
        surname: Joi.string().regex(/^[A-z]+$/, { name: 'alpha' }).max(15).required(),
        gender: Joi.string().only('M', 'F').required(),
        birthDate: Joi.date().min('01-01-1900').max('now').required(),
        biography: Joi.string().min(10).max(4000),
        photo: Joi.binary().encoding('base64').max(1*1024*1024).allow(null),
        nationality: Joi.string().country().required(),
        isAnonymous: Joi.number().only(0, 1).required()
    })
};