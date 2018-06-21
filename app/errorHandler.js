'use strict';

const { StatusError } = require('./errors');

module.exports = function(err, req, res, next) {
    if (err instanceof StatusError)
    {
        res.status(err.status).json({ 'error': err.message });
    }
    else
    {
        console.log(`Unknown error while serving ${req.originalUrl}:`, err.stack);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
}