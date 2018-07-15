const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports = {
    body: Joi.object().keys({
        codDisease: Joi.number().required(),
        codForumThread: Joi.number().required(),
        codForumMessage: Joi.number().required(),
        vote: Joi.boolean().required()
    })
};