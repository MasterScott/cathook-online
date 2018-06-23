'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const Server = require('../Server');
const middleware = require('../middleware');

const nameRegex = /^[0-9a-z_]{1,32}$/;

// Create a new group
router.post('/', [
    middleware.authentication,
    middleware.notAnonymous,
    check('name').matches(nameRegex),
    check('display').optional().isLength({ min: 3, max: 32 }),
    middleware.authorization({ group: 'admin' }),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const data = req.locals.data;
    Server.logger.info('+ group %s "%s"', data.name, data.display);
    const id = await Server.sys.group.create(data);
    res.status(201).end(id);
}));

// Delete group by id
router.delete('/:id', [
    middleware.authentication,
    middleware.notAnonymous,
    check('id').isNumeric(),
    middleware.authorization({ group: 'admin' }),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const data = req.locals.data;
    Server.logger.info('- group %s', data.id);
    await Server.sys.group.delete(data.id);
    res.status(200).end();
}));

// List all groups
router.get('/', [
    middleware.authentication
], wrap(async function(req, res) {
    res.status(200).json(await Server.sys.group.getAllGroups());
}));

module.exports = router;
