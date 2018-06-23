'use strict';

const wrap = require('async-middleware').wrap;
const Server = require('../Server');

module.exports = function(options) {
    return wrap(async function(req, res, next) {
        if (!req.locals.user)
            throw new Server.errors.InternalServerError('Authorization before authentication');
        const groupId = await Server.sys.group.getId(options.group);
        const userId = await Server.db.getUserId(req.locals.user.username);
        const s = await Server.sys.user.hasGroup(userId, groupId);
        if (!s)
            throw new Server.errors.Forbidden(`You need group ${options.group} for that action`);
        next();
    });
}