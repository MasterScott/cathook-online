'use strict';

const { validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const Server = require('./Server');

module.exports = {
    authentication: require('./mw/authentication'),
    authorization: require('./mw/authorization'),
    passedAllChecks: function (req, res, next)
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new Server.errors.UnprocessableEntity(errors.array());
        if (req.locals == null)
            req.locals = {};
        req.locals.data = matchedData(req);
        next();
    },
    // Must be called after authentication
    notAnonymous: function (req, res, next)
    {
        if (req.locals.anonymous)
            throw new Server.errors.Forbidden('Anonymous accounts cannot access this API');
        next();
    }
}
