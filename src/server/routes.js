const express = require('express');
const router = express.Router();

const validate = require('express-validation');
const signupSchema = require('./validation/signup_schema');
const activationSchema = require('./validation/activation_schema');
const loginSchema = require('./validation/login_schema');
const userUpdateSchema = require('./validation/user_update_schema')

const signupService = require('./services/signup.service');
const authenticationService = require('./services/authentication.service');
const userService = require('./services/user.service');

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
 * Activate the user.
 */
router.post('/activation', validatePayloadMiddleware, validate(activationSchema), (req, res) => {
    signupService.activate(req, res);
})

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
 * Logs the user out of the application.
 */
router.post('/logout', (req, res) => {
    authenticationService.logout(req, res);
})

/**
 * Gets some statistics about the registered users.
 */
router.get('/usersStats', (req, res) => {
    userService.getUsersStats(req, res);
});

/**
 * Gets the data of a registered user.
 */
router.get('/users/:id', (req, res) => {
    userService.getUser(req, res);
});

/**
 * Updates the data of a registered user.
 */
router.put('/users/:id', validatePayloadMiddleware, validate(userUpdateSchema), (req, res) => {
    userService.putUser(req, res);
});

/**
 * Deletes a registered user.
 */
router.delete('/users/:id', (req, res) => {
    userService.deleteUser(req, res);
});

module.exports = router;