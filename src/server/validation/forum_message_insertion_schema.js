const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports = {
    body: Joi.object().keys({
        codUser: Joi.number().required(),
        codDisease: Joi.number().required(),
        codForumThread: Joi.number().required(),
        content: Joi.string().max(2000).required(),
        parent: Joi.objectId()
    })
};