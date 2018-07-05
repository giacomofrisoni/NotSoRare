const Joi = require('joi');

module.exports = {
    body: Joi.object().keys({
        user: Joi.number().required()
    })
};