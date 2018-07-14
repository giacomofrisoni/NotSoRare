const Joi = require('joi');

module.exports = {
    body: Joi.object().keys({
        codUser: Joi.number().required(),
        codDisease: Joi.number().required(),
        codForumThread: Joi.number().required(),
        content: Joi.string().min(10).max(2000).required(),
    })
};