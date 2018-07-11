const Joi = require('joi');

module.exports = {
    body: Joi.object().keys({
        codDisease: Joi.number().required(),
        codUser: Joi.number().required()
    })
};