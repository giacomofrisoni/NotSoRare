const User = require('./user.model');

require('./mongo').connect();

function getUsers(req, res) {
    const docquery = User.find({});
    docquery
        .exec()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(error => {
            res.status(500).send(error);
            return;
        });
}

function postUser(req, res) {
    const originalUser = {
        id: req.body.id,
        email: req.body.email,
        first_name = req.body.first_name,
        last_name = req.body.last_name,
        gender = req.body.gender,
        birth_date = req.body.birth_date,
        nationality = req.body.nationality,
        biografy = req.body.biografy,
        image = req.body.image,
        registration_date = req.body.registration_date,
        ban_date = req.body.ban_date
    };
    const user = new User(originalUser);
    user.save(error => {
        if (checkServerError(res, error)) return;
        res.status(201).json(hero);
        console.log('user created successfully!');
    });
}

function checkServerError(res, error) {
    if (error) {
        res.status(500).send(error);
        return error;
    }
}

module.exports = {
    getUsers,
    postUser
}