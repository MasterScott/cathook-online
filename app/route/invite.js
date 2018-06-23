'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const Server = require('../Server');
const middleware = require('../middleware');

// Generate new invite
router.post('/', [
    middleware.authentication,
    middleware.notAnonymous,
    middleware.authorization({ groups: ['can_invite'] })
], wrap(async function(req, res) {
    const key = await Server.sys.invite.createInvite(req.locals.user);
    res.status(201).end(key);
}));

// Get all invites you generated
router.get('/', [
    middleware.authentication,
    middleware.notAnonymous
], wrap(async function(req, res) {
    const invites = await Server.sys.invite.getInvites(req.locals.user);
    res.status(200).json(invites);
}));

module.exports = router;
