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
    middleware.notAnonymous,
    middleware.authorization(),
    check('name').isLength({ min: 3, max: 32 }),
    check('developers').isLength({ max: 255 }),
    check('url').optional().isLength({ max: 255 }).isURL(),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const data = req.locals.data;
    Server.logger.info('Creating new software %s, by %s (%s)', data.name, data.developers, data.url);
    const id = await Server.sys.software.create(data);
    res.status(201).end(id);
}));

// Delete software by ID
router.delete('/:id', [
    middleware.authentication,
    middleware.notAnonymous,
    middleware.authorization(),
    check('id').isNumeric(),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const data = req.locals.data;
    Server.logger.info('- software %s', data.id);
    Server.sys.software.delete(data.id);
    res.status(200).end();
}));

// List all software (does not require auth - used in registration)
router.get('/', wrap(async function(req, res) {
    res.status(200).json(await Server.sys.software.getAllSoftware());
}));

module.exports = router;