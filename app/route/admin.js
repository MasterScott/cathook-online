'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const Server = require('../Server');
const middleware = require('../middleware');

/*
    Administrative Tools
*/

router.get('/stats', [
    middleware.authentication,
    middleware.notAnonymous,
    middleware.authorization()
], wrap(async function(req, res) {
    const stats = await Server.db.getCountStats();
    res.status(200).json(stats);
}));

module.exports = router;
