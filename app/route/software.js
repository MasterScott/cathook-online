'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const Server = require('../Server');
const middleware = require('../middleware');

// Create new software
router.post('/', [
    middleware.authentication,
//    middleware.authorization({ role: 'admin' }),
    check('name').isLength({ min: 3, max: 32 }),
    check('developers').isLength({ max: 255 }),
    check('url').isLength({ max: 255 }).isURL(),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const data = req.locals.data;
    Server.logger.info('Creating new software %s, by %s (%s)', data.name, data.developers, data.url);
    await Server.sys.role.createRole(req.locals.data.name, req.locals.data.display);
    res.status(201).end();
}));

// Delete software by ID
router.delete('/:id', [
    middleware.authentication,
//    middleware.authorization({ role: 'admin' }),
    check('name').isLength({ min: 3, max: 32 }),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const data = req.locals.data;
    Server.logger.info('Deleting software %s', data.name);
    Server.sys.software.delete(data.name);
    res.status(200).end();
}));

// List all software
router.get('/', [
    middleware.authentication
], wrap(async function(req, res) {
    res.status(200).json(Server.sys.software.getAllSoftware());
}));

module.exports = router;