const BaseJoi = require('joi');
const JoiCountryExtension = require('joi-country-extension');
const Joi = BaseJoi.extend(JoiCountryExtension);

module.exports = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().regex(/[a-zA-Z0-9]{8,30}/).required(),
        passwordConfirm: Joi.string().only(Joi.ref('password')).required(),
        name: Joi.string().regex(/^[A-z]+$/, { name: 'alpha' }).max(15).required(),
        surname: Joi.string().regex(/^[A-z]+$/, { name: 'alpha' }).max(15).required(),
        gender: Joi.string().only('M', 'F').required(),
        birthDate: Joi.date().min('01-01-1900').max('now').required(),
        biography: Joi.string().min(10).max(4000).allow(null),
        photoContentType: Joi.string(),
        photoData: Joi.binary().encoding('base64').max(1*1024*1024).allow(null),
        nationality: Joi.string().country().required(),
        patientYN: Joi.number().only('0', '1').required(),
        patientName: Joi.string().regex(/^[A-z]+$/, { name: 'alpha' }).max(15).when('patientYN', { is: '0', then: Joi.required(), otherwise: Joi.only(null) }),
        patientSurname: Joi.string().regex(/^[A-z]+$/, { name: 'alpha' }).max(15).when('patientYN', { is: '0', then: Joi.required(), otherwise: Joi.only(null) }),
        patientGender: Joi.string().only('M', 'F').when('patientYN', { is: '0', then: Joi.required(), otherwise: Joi.only(null) }),
        patientBirthDate: Joi.date().min('01-01-1900').max('now').when('patientYN', { is: '0', then: Joi.required(), otherwise: Joi.only(null) }),
        patientNationality: Joi.string().country().when('patientYN', { is: '0', then: Joi.required(), otherwise: Joi.only(null) })
    })
};