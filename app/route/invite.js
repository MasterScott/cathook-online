'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const Server = require('../Server');
const middleware = require('../middleware');

// Generate new invite
router.post('/', [
    middleware.authentication
], wrap(async function(req, res) {
    try {
        const key = await Server.sys.invite.createInvite(req.locals.user);
        res.status(201).end(key);
    } catch (e) {
        res.status(400).end(e.message);
    }
}));

// Get all invites you generated
router.get('/', [
    middleware.authentication
], wrap(async function(req, res) {
    try {
        const invites = await Server.sys.invite.getInvites(req.locals.user);
        res.status(200).json(invites);
    } catch (e) {
        res.status(400).end(e.message);
    }
}));

module.exports = router;
