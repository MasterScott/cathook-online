'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const Server = require('../Server');
const middleware = require('../middleware');

/*
    Administrative Tools
*/

module.exports = router;
