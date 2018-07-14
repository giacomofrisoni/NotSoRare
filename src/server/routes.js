const express = require('express');
const router = express.Router();

const validate = require('express-validation');
const signupSchema = require('./validation/signup_schema');
const activationSchema = require('./validation/activation_schema');
const loginSchema = require('./validation/login_schema');
const rareDiseasesSearchSchema = require('./validation/rare_diseases_search_schema');
const experienceInsertionSchema = require('./validation/experience_insertion_schema');
const experienceUpdateSchema = require('./validation/experience_update_schema');
const forumThreadInsertionSchema = require('./validation/forum_thread_insertion_schema');
const forumThreadUpdateSchema = require('./validation/forum_thread_update_schema');
const forumMessageInsertionSchema = require('./validation/forum_message_insertion_schema');
const forumMessageUpdateSchema = require('./validation/forum_message_update_schema');
const userUpdateSchema = require('./validation/user_update_schema');
const interestInsertionSchema = require('./validation/interest_insertion_schema');

const signupService = require('./services/signup.service');
const authenticationService = require('./services/authentication.service');
const rareDiseaseService = require('./services/raredisease.service');
const experiencesService = require('./services/experiences.service');
const forumThreadsService = require('./services/forum_threads_service');
const forumMessagesService = require('./services/forum_messages_service');
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
 * SIGNUP & AUTHENTICATION
 */

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
 * RARE DISEASES
 */

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
 * EXPERIENCES
 */

/**
 * Adds a new experience.
 */
router.post('/experiences', validatePayloadMiddleware, validate(experienceInsertionSchema), (req, res) => {
    experiencesService.postExperience(req, res);
});

/**
 * Updates the data of a registered experience.
 */
router.put('/rareDiseases/:idDisease/experiences/:idUser', validatePayloadMiddleware, validate(experienceUpdateSchema), (req, res) => {
    experiencesService.putExperience(req, res);
});

/**
 * Deletes a registered experience.
 */
router.delete('/rareDiseases/:idDisease/experiences/:idUser', (req, res) => {
    experiencesService.deleteExperience(req, res);
});

/**
 * Gets an experience.
 */
router.get('/rareDiseases/:idDisease/experiences/:idUser', (req, res) => {
    experiencesService.getExperience(req, res);
});

/**
 * Gets all the experiences for a rare disease.
 */
router.get('/rareDiseases/:id/experiences', (req, res) => {
    experiencesService.getRareDiseaseExperiences(req, res);
});

/**
 * Gets the references for the experiences of a user.
 */
router.get('/users/:id/experiences', (req, res) => {
    experiencesService.getUserExperiencesReferences(req, res);
});


/**
 * FORUM THREADS
 */

/**
 * Adds a new forum thread.
 */
router.post('/forumThreads', validatePayloadMiddleware, validate(forumThreadInsertionSchema), (req, res) => {
    forumThreadsService.postForumThread(req, res);
});

/**
 * Updates the data of a registered forum thread.
 */
router.put('/rareDiseases/:idDisease/forumThreads/:idForumThread', validatePayloadMiddleware, validate(forumThreadUpdateSchema), (req, res) => {
    forumThreadsService.putForumThread(req, res);
});

/**
 * Deletes a registered forum thread.
 */
router.delete('/rareDiseases/:idDisease/forumThreads/:idForumThread', (req, res) => {
    forumThreadsService.deleteForumThread(req, res);
});

/**
 * Gets the forum threads for a rare disease.
 */
router.get('/rareDiseases/:id/forumThreads', (req, res) => {
    forumThreadsService.getRareDiseaseForumThreads(req, res);
});

/**
 * Gets the forum threads published by a user.
 */
router.get('/users/:id/forumThreads', (req, res) => {
    forumThreadsService.getUserForumThreads(req, res);
});


/**
 * FORUM MESSAGES
 */

/**
 * Adds a new forum message.
 */
router.post('/forumMessages', validatePayloadMiddleware, validate(forumMessageInsertionSchema), (req, res) => {
    forumMessagesService.postForumMessage(req, res);
});

/**
 * Updates the data of a registered forum message.
 */
router.put('/rareDiseases/:idDisease/forumThreads/:idForumThread/forumMessages/:idForumMessage', validatePayloadMiddleware, validate(forumMessageUpdateSchema), (req, res) => {
    forumMessagesService.putForumMessage(req, res);
});

/**
 * Deletes a registered forum message.
 */
router.delete('/rareDiseases/:idDisease/forumThreads/:idForumThread/forumMessages/:idForumMessage', (req, res) => {
    forumMessagesService.deleteForumMessage(req, res);
});


/**
 * EXPERT CENTRES
 */

/**
 * Gets the expert centres for a rare disease.
 */
router.get('/rareDiseases/:id/expertCentres', (req, res) => {
    rareDiseaseService.getRareDiseaseExpertCentres(req, res);
});


/**
 * REFERENCES
 */

/**
 * Gets the references for a rare disease.
 */
router.get('/rareDiseases/:id/references', (req, res) => {
    rareDiseaseService.getRareDiseaseReferences(req, res);
});


/**
 * USERS
 */

/**
 * Gets some statistics about the registered users.
 */
router.get('/usersStats', (req, res) => {
    userService.getUsersStats(req, res);
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
 * Gets the data of a registered user.
 */
router.get('/users/:id', (req, res) => {
    userService.getUser(req, res);
});


/**
 * INTERESTS
 */

/**
 * Adds a new rare disease interest for a user.
 */
router.post('/interests', validatePayloadMiddleware, validate(interestInsertionSchema), (req, res) => {
    userRareDiseasesService.addUserInterest(req, res);
});

/**
 * Deletes a rare disease interest of a user.
 */
router.delete('/users/:idUser/interests/:idDisease', (req, res) => {
    userRareDiseasesService.removeUserInterest(req, res);
});

/**
 * Gets the registered rare disease interests for a user.
 */
router.get('/users/:id/interests/', (req, res) => {
    userRareDiseasesService.getUserInterests(req, res);
});

/**
 * Checks if user is interested in a rare disease.
 */
router.get('/users/:idUser/interests/:idDisease', (req, res) => {
    userRareDiseasesService.isUserInterested(req, res);
});


/**
 * Handles 404.
 */
router.all('*', function (req, res) {
    return res.status(404).send("404: Page Not Found");
});


module.exports = router;