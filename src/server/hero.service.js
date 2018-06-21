const Hero = require('./models/hero.model');

require('./mongo').connect();

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

function checkServerError(res, error) {
    if (error) {
        res.status(500).send(error);
        return error;
    }
}

module.exports = {
    getHeroes,
    postHero
}