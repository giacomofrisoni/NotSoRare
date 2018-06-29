const Hero = require('../models/hero.model');


function getHeroes(req, res) {
    const docquery = Hero.find({});
    docquery
        .exec()
        .then(heroes => {
            res.status(200).json(heroes);
        })
        .catch(error => {
            res.status(500).send(error);
            return;
        });
}

function postHero(req, res) {
    const originalHero = { id: req.body.id, name: req.body.name, saying: req.body.saying };
    const hero = new Hero(originalHero);
    hero.save(error => {
        if (checkServerError(res, error)) return;
        res.status(201).json(hero);
        console.log('hero created successfully!');
    });
}

function putHero(req, res) {
    const id = parseInt(req.params.id, 10);
    const updatedHero = { id: id, name: req.body.name, saying: req.body.saying };
    Hero.findOne({ id: id }, (error, hero) => {
        if (checkServerError(res, error)) return;
        if (checkFound(res, hero)) return;
        hero.name = updatedHero.name;
        hero.saying = updatedHero.saying;
        hero.save(error => {
            if (checkServerError(res, error)) return;
            res.status(200).json(hero);
            console.log('hero updated successfully!');
        });
    })
}

function deleteHero(req, res) {
    const id = parseInt(req.params.id, 10);
    Hero.findOneAndRemove({ id: id })
        .then(hero => {
            if (!checkFound(res, hero)) return;
            res.status(200).json(hero);
            console.log('hero deleted successfully');
        })
        .catch(error => {
            if (checkServerError(res, error)) return;
        });
}

function checkFound(res, hero) {
    if (!hero) {
        res.status(404).send('Hero not found.');
        return;
    }
    return hero;
}

function checkServerError(res, error) {
    if (error) {
        res.status(500).send(error);
        return error;
    }
}

module.exports = {
    getHeroes,
    postHero,
    putHero,
    deleteHero
};