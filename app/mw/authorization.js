'use strict';

const wrap = require('async-middleware').wrap;
const Server = require('../Server');

module.exports = function(options) {
    let groups = options ? options.groups : null;
    if (groups == null)
        groups = ['admin'];
    else
        groups.push('admin');
    return wrap(async function(req, res, next) {
        if (!req.locals.user)
            throw new Server.errors.InternalServerError('Authorization before authentication');
        const s = await Server.db.checkAnyOfGroups(req.locals.user.username, groups);
        if (!s)
            throw new Server.errors.Forbidden(`You need to be in any of the groups: (${groups}) for that action`);
        next();
    });
}