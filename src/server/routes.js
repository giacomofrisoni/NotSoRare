const express = require('express');
const router = express.Router();

const validate = require('express-validation');
const signupSchema = require('./validation/signup_schema');
const activationSchema = require('./validation/activation_schema');
const loginSchema = require('./validation/login_schema');
const rareDiseasesSearchSchema = require('./validation/rare_diseases_search_schema');
const userUpdateSchema = require('./validation/user_update_schema');
const interestInsertionSchema = require('./validation/interest_insertion_schema');

const signupService = require('./services/signup.service');
const authenticationService = require('./services/authentication.service');
const rareDiseaseService = require('./services/raredisease.service');
const userService = require('./services/user.service');
const userRareDiseasesService = require('./services/user_rarediseases.service');

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
});

/**
 * Logs the user out of the application.
 */
router.post('/logout', (req, res) => {
    authenticationService.logout(req, res);
});

/**
 * Searches rare diseases by name.
 */
router.post('/rareDiseases/search', validatePayloadMiddleware, validate(rareDiseasesSearchSchema), (req, res) => {
    rareDiseaseService.searchRareDiseases(req, res);
});

/**
 * Gets the data of all registered rare diseases.
 */
router.get('/rareDiseases', (req, res) => {
    rareDiseaseService.getRareDiseases(req, res);
});

/**
 * Gets the data of a rare disease.
 */
router.get('/rareDiseases/:id', (req, res) => {
    rareDiseaseService.getRareDisease(req, res);
});

/**
 * Gets the references for a rare disease.
 */
router.get('/rareDiseases/:id/references', (req, res) => {
    rareDiseaseService.getRareDiseaseReferences(req, res);
});

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

/**
 * Adds a new rare disease interest for a user.
 */
router.post('/interests', validatePayloadMiddleware, validate(interestInsertionSchema), (req, res) => {
    userRareDiseasesService.addUserInterest(req, res);
});

/**
 * Deletes a rare disease interest of a user.
 */
router.delete('/interests/:idDisease/:idUser', (req, res) => {
    userRareDiseasesService.removeUserInterest(req, res);
});

/**
 * Gets the registered rare disease interests for a user.
 */
router.get('/interests/:idUser', (req, res) => {
    userRareDiseasesService.getUserInterests(req, res);
});

/**
 * Checks if user is interested in a rare disease.
 */
router.get('/interests/:idDisease/:idUser', (req, res) => {
    userRareDiseasesService.isUserInterested(req, res);
});

/**
 * Handles 404.
 */
router.all('*', function (req, res) {
    return res.status(404).send("404: Page Not Found");
});

module.exports = router;