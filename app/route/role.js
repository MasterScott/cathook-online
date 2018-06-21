'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const Server = require('../Server');
const middleware = require('../middleware');

// Create a new role
router.post('/', [
    middleware.authentication,
    check('name').isLength({ min: 3, max: 32 }),
    check('display').optional().isLength({ min: 3, max: 32 }),
//    middleware.authorization({ role: 'admin' }),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    Server.logger.info('Creating a new role %s "%s"', req.locals.data.name, req.locals.data.display);
    await Server.sys.role.createRole(req.locals.data.name, req.locals.data.display);
    res.status(201).end();
}));

// Get all invites you generated
router.get('/', [
    middleware.authentication
], wrap(async function(req, res) {
    const invites = await Server.sys.invite.getInvites(req.locals.user);
    res.status(200).json(invites);
}));

module.exports = router;
