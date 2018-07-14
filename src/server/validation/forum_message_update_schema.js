const Joi = require('joi');

module.exports = {
    body: Joi.object().keys({
        content: Joi.string().min(10).max(2000).required(),
    })
};