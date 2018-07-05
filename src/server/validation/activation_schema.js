const Joi = require('joi');

module.exports = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        activationCode: Joi.string().regex(/^[0-9]*$/, { name: 'numeric' }).length(6).required()
    })
};