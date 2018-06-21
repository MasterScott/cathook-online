'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const Server = require('../Server');
const middleware = require('../middleware');

const nameRegex = /^[0-9a-z_]{1,32}$/;

// Create a new role
router.post('/', [
    middleware.authentication,
    check('name').matches(nameRegex),
    check('display').optional().isLength({ min: 3, max: 32 }),
    middleware.authorization({ role: 'admin' }),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const data = req.locals.data;
    Server.logger.info('+ role %s "%s"', data.name, data.display);
    const id = await Server.sys.role.create(data);
    res.status(201).end(id);
}));

// Delete role by id
router.delete('/:id', [
    middleware.authentication,
    check('id').isNumeric(),
    middleware.authorization({ role: 'admin' }),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const data = req.locals.data;
    Server.logger.info('- role %s', data.id);
    await Server.sys.role.delete(data.id);
    res.status(200).end();
}));

// List all roles
router.get('/', [
    middleware.authentication
], wrap(async function(req, res) {
    res.status(200).json(await Server.sys.role.getAllRoles());
}));

module.exports = router;
