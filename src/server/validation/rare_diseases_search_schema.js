const Joi = require('joi');

module.exports = {
    body: Joi.object().keys({
        text: Joi.string().min(1).required()
    })
};