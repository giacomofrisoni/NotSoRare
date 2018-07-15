const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports = {
    body: Joi.object().keys({
        vote: Joi.boolean().required()
    })
};