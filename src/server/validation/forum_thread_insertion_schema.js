const Joi = require('joi');

module.exports = {
    body: Joi.object().keys({
        codUser: Joi.number().required(),
        codDisease: Joi.number().required(),
        title: Joi.string().min(10).max(200).required(),
        description: Joi.string().min(10).max(2000).required()
    })
};