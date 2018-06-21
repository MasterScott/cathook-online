'use strict';

const wrap = require('async-middleware').wrap;
const Server = require('../Server');

module.exports = wrap(async function(req, res, next)
{
    if (!req.locals)
        req.locals = {};

    if (req.locals.hasOwnProperty('auth'))
    {
        if (req.locals.auth)
            next();
        return;
    }

    if (!req.query.hasOwnProperty('key'))
    {
        res.status(401).end('Missing key');
        req.locals.auth = false;
        return;
    }
    const key = req.query.key;

    if (typeof key != 'string')
    {
        res.status(400).end('Bad key');
        req.locals.auth = false;
        return;
    }
    const user = await Server.db.getUserFromKey(key);
    if (user == null)
    {
        res.status(401).end('Key not found');
        req.locals.auth = false;
        return;
    }

    if (user.username == 'anonymous')
    {
        user.anonymous = true;
        req.locals.anonymous = true;
    }

    req.locals.auth = true;
    req.locals.user = user;
    next();
});
