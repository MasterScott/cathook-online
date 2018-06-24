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
    await Server.sys.software.create(req.locals.data);
    res.status(201).end();
}));

// Delete software by ID
router.delete('/:id', [
    middleware.authentication,
    middleware.notAnonymous,
    middleware.authorization(),
    check('id').isNumeric(),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    Server.sys.software.delete(req.locals.data.id);
    res.status(200).end();
}));

// List all software (does not require auth - used in registration)
router.get('/', wrap(async function(req, res) {
    res.status(200).json(await Server.sys.software.getAllSoftware());
}));

module.exports = router;