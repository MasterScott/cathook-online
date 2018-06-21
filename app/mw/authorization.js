'use strict';

const wrap = require('async-middleware').wrap;
const Server = require('../Server');

module.exports = function(options) {
    return wrap(async function(req, res, next) {
        if (!req.locals.user)
            throw new Server.errors.InternalServerError('Authorization before authentication');
        const roleId = await Server.sys.role.getId(options.role);
        const userId = await Server.db.getUserId(req.locals.user.username);
        const s = await Server.sys.user.hasRole(userId, roleId);
        if (!s)
            throw new Server.errors.Forbidden(`You need role ${options.role} for that action`);
        next();
    });
}