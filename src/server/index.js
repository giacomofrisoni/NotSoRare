const express = require('express');
const session = require('express-session');
const i18n = require('i18n-2');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const routes = require('./routes');

const ev = require('express-validation');

const root = './';
const port = process.env.Port || 3000;

/**
 * Creating a new express app.
 */
const app = express();

/**
 * Attaches the i18n property to the express request object.
 */
i18n.expressBind(app, {
    // Setups some locales - other locales default to en silently
    locales: ['en', 'it', 'pl'],
    // Sets the cookie name
    cookieName: 'locale',
    // Sets the query parameter to switch locale (ie. /home?lang=ch)
    queryParameter: 'lang',
    // Sets the directory in which to find the locale data files
    directory: __dirname + '/locales',
    // Sets the extension of the locale data files
    extension: '.json'
});

/**
 * For being able to read request bodies.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(root, 'dist')));

/**
 * Session handler.
 */
app.use(session({
    // It is used to sign the session ID cookie (hashing): without it, access to the session would essentially be "denied"
    secret: 'h)ZD$H/+d5K7KE_m',
    // Saves the session whenever a change is directly made to it
    resave: false,
    // Does not save cookies and sessions at page visiting in order to not take up any unneeded storage space on server
    saveUninitialized: false
}));

/*
 * Language control executed for each request.
 * If the value is specified, sets the locale from query parameter and save
 * the preferred language as a cookie in order to mantain it between different pages
 * (persisting switch).
 * Otherwise loads the language from from req.cookies (lower priority).
 * If the language preference is not expressed by the client neither via query parameter
 * nor via cookies, use the default setting.
 */
app.use((req, res, next) => {
    if (req.query.lang) {
        req.i18n.setLocaleFromQuery();
        res.cookie('locale', req.i18n.getLocale());
    } else {
        req.i18n.setLocaleFromCookie();
    }
    next();
});

/**
 * Error handler.
 */
app.use((err, req, res, next) => {
    // Specific for validation errors
    if (err instanceof ev.ValidationError) return res.status(err.status).json(err);
    // Other type of errors, it *might* also be a Runtime Error
    if (process.env.NODE_ENV !== 'production') {
        return res.status(500).send(err.stack);
    } else {
        return res.status(500);
    }
});

app.use('/api', routes);
app.get('*', (req, res) => {
    res.sendFile('dist/index.html', { root });
});

/**
 * Listening on port.
 */
app.listen(port, () => console.log(`API running on localhost:${port}`));