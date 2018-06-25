const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');

const ev = require('express-validation');

const root = './';
const port = process.env.Port || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(root, 'dist')));
app.use('/api', routes);
app.get('*', (req, res) => {
    res.sendFile('dist/index.html', { root });
});
app.listen(port, () => console.log(`API running on localhost:${port}`));

// error handler
app.use((err, req, res, next) => {
    // specific for validation errors
    if (err instanceof ev.ValidationError) return res.status(err.status).json(err);
    // other type of errors, it *might* also be a Runtime Error
    if (process.env.NODE_ENV !== 'production') {
        return res.status(500).send(err.stack);
    } else {
        return res.status(500);
    }
});