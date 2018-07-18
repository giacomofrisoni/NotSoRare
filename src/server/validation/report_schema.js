const Joi = require('joi');

module.exports = {
    body: Joi.object().keys({
        codDisease: Joi.number().required(),
        codForumThread: Joi.number().required(),
        codForumMessage: Joi.number().required()
    })
};