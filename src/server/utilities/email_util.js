// Data environment
const email = require('../env/email_environment');

// Module for email handling
const nodemailer = require('nodemailer');

function sendHTML(to, subject, html, callback) {

    let transporter = nodemailer.createTransport({
        service: email.service,
        auth: {
            user: email.user,
            pass: email.password
        }
    });

    let mailOptions = {
        from: email.from,
        to: to,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        callback(error, info);
    })

}

module.exports = {
    sendHTML
};