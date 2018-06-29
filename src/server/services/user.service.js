const User = require('../models/user.model');


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
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        gender: req.body.gender,
        image: req.body.image,
        birth_date: req.body.birth_date,
        is_anonymous: req.body.is_anonymous
    };
    const user = new User(originalUser);
    user.save(error => {
        if (checkServerError(res, error)) return;
        res.status(201).json(user);
        console.log('user created successfully!');
    });
}

function putUser(req, res) {
    const id = parseInt(req.params.id, 10);
    const updatedUser = {
        id: req.body.id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        gender: req.body.gender,
        image: req.body.image,
        birth_date: req.body.birth_date,
        is_anonymous: req.body.is_anonymous
    };
    User.findOne({ id: id }, (error, user) => {
        if (checkServerError(res, error)) return;
        if (checkFound(res, user)) return;
        user.first_name = updatedUser.first_name;
        user.last_name = updatedUser.last_name;
        user.gender = updatedUser.gender;
        user.image = updatedUser.image;
        user.birth_date = updatedUser.birth_date;
        user.is_anonymous = updatedUser.is_anonymous;
        user.save(error => {
            if (checkServerError(res, error)) return;
            res.status(200).json(user);
            console.log('user updated successfully!');
        });
    })
}

function deleteUser(req, res) {
    const id = parseInt(req.params.id, 10);
    User.findOneAndRemove({ id: id })
        .then(user => {
            if (!checkFound(res, user)) return;
            res.status(200).json(user);
            console.log('user deleted successfully');
        })
        .catch(error => {
            if (checkServerError(res, error)) return;
        });
}

function checkFound(res, user) {
    if (!user) {
        res.status(404).send('User not found.');
        return;
    }
    return user;
}

function checkServerError(res, error) {
    if (error) {
        res.status(500).send(error);
        return error;
    }
}

module.exports = {
    getUsers,
    postUser,
    putUser,
    deleteUser
};