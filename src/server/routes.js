const express = require('express');
const router = express.Router();

const validate = require('express-validation');
const signupSchema = require('./validation/signup_schema');

const signupService = require('./services/signup.service');
const heroService = require('./services/hero.service');


router.post('/signup', validate(signupSchema), (req, res) => {
    signupService.signup(req, res);
});

router.get('/heroes', (req, res) => {
    heroService.getHeroes(req, res);
});

router.post('/hero', (req, res) => {
    heroService.postHero(req, res);
});

router.put('/hero/:id', (req, res) => {
    heroService.putHero(req, res);
});

router.delete('/hero/:id', (req, res) => {
    heroService.deleteHero(req, res);
});

module.exports = router;