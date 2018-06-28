const express = require('express');
const router = express.Router();

const validate = require('express-validation');
const signupSchema = require('./validation/signup_schema');
const loginSchema = require('./validation/login_schema');

const signupService = require('./services/signup.service');
const authenticationService = require('./services/authentication.service');
const heroService = require('./services/hero.service');

/**
 * Middleware to check that a payload is present.
 */
const validatePayloadMiddleware = (req, res, next) => {
    if (req.body) {
        next();
    } else {
        res.status(403).send({
            errorMessag: req.i18n.__("Err_PayloadRequirement")
        });
    }
}

/**
 * Registers the user.
 */
router.post('/signup', validatePayloadMiddleware, validate(signupSchema), (req, res) => {
    signupService.signup(req, res);
});

/**
 * Logs the user in.
 */
router.post('/login', validatePayloadMiddleware, validate(loginSchema), (req, res) => {
    authenticationService.login(req, res);
});

/**
 * Checks if user is logged in.
 */
router.get('/login', (req, res) => {
    authenticationService.isLoggedIn(req, res);
})

/**
 * Log the user out of the application.
 */
router.post('/logout', (req, res) => {
    authenticationService.logout(req, res);
})

router.get('/heroes', (req, res) => {
    heroService.getHeroes(req, res);
});

router.post('/hero', validatePayloadMiddleware, (req, res) => {
    heroService.postHero(req, res);
});

router.put('/hero/:id', (req, res) => {
    heroService.putHero(req, res);
});

router.delete('/hero/:id', (req, res) => {
    heroService.deleteHero(req, res);
});

module.exports = router;