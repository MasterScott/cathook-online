'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const Server = require('../Server');
const middleware = require('../middleware');

const groupRegex = /^[0-9a-z_]{3,32}$/;

// Create a new group
router.post('/', [
    middleware.authentication,
    middleware.notAnonymous,
    check('name').matches(groupRegex),
    check('display').optional().isLength({ min: 3, max: 32 }),
    middleware.authorization(),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    await Server.sys.group.create(req.locals.data);
    res.status(201).end();
}));

// Delete group by name
router.delete('/:name', [
    check('name').matches(groupRegex),
    middleware.passedAllChecks,
    middleware.authentication,
    middleware.notAnonymous,
    middleware.authorization()
], wrap(async function(req, res) {
    await Server.sys.group.delete(req.locals.data.name);
    res.status(200).end();
}));

// List all groups
router.get('/', wrap(async function(req, res) {
    res.status(200).json(await Server.sys.group.getAllGroups());
}));

module.exports = router;
