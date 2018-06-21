'use strict';

const wrap = require('async-middleware').wrap;
const Server = require('../Server');

module.exports = wrap(async function(req, res, next)
{
    if (!req.locals)
        req.locals = {};

    if (req.locals.hasOwnProperty('user'))
    {
        next();
        return;
    }

    if (!req.query.hasOwnProperty('key'))
    {
        throw new Server.errors.UnprocessableEntity('Missing key');
    }
    const key = req.query.key;

    if (typeof key != 'string')
    {
        throw new Server.errors.UnprocessableEntity('Bad key type');
    }
    const user = await Server.db.getUserFromKey(key);
    if (user == null)
    {
        throw new Server.errors.Unauthorized('Key not found');
    }

    if (user.username == Server.config.anonymousAccount)
    {
        user.anonymous = true;
        req.locals.anonymous = true;
    }

    req.locals.user = user;
    next();
});
