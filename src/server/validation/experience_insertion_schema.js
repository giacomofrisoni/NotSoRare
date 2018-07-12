const Joi = require('joi');

module.exports = {
    body: Joi.object().keys({
        codDisease: Joi.number().required(),
        codUser: Joi.number().required(),
        photo: Joi.binary().encoding('base64').max(1*1024*1024).allow(null),
        description: Joi.string().min(100).max(4000)
    })
};