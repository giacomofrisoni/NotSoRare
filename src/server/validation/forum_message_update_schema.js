const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports = {
    body: Joi.object().keys({
        content: Joi.string().min(10).max(2000).required(),
        utilityVotes: Joi.array().items(Joi.object().keys({
            user: Joi.objectId(),
            vote: Joi.bool().required()
        }))
    })
};