'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const middleware = require('../middleware')

const Server = require('../Server');

const usernameRegex = /^[0-9_a-z\-]{3,32}$/i;
const passwordRegex = /^[0-9a-f]{64}$/;

// Show your own info
router.get('/me', [ middleware.authentication ], (req, res) => {
    res.status(200).json(Server.sys.user.info(req.locals.user));
});

// Register a new user
router.post('/register', [
    check('username').matches(usernameRegex).withMessage('Username must be between 3 and 32 characters long, allowed characters: 0-9, a-z, _ and -'),
    check('password').matches(passwordRegex),
    check('invite').isLength({ max: 255 }),
    check('mail').isLength({ max: 255 }).isEmail(),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const key = await Server.sys.user.register(req.locals.data);
    res.status(201).end(key);
}));

// Get user info
router.get('/id/:name', (req, res) => {
    throw new Server.errors.NotImplemented();
});

// Get user by Steam ID
router.get('/steam/:steam', [
    check('steam').matches(/^\d{1,10}$/),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const user = await Server.db.getUserBySteamId(req.locals.data.steam);
    if (user)
        res.status(200).json(Server.sys.user.info(user));
    else
        throw new Server.errors.NotFound();
}));

// Return access key
router.post('/login', [
    check('username').matches(usernameRegex),
    check('password').matches(passwordRegex),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const key = await Server.sys.user.login(req.locals.data.username, req.locals.data.password);
    if (key == null)
        throw new Server.errors.InternalServerError();
    else
        res.status(200).end(key);
}));

// Add user role
router.post('/id/:name/role/:id', [
    middleware.authentication,
    middleware.authorization({ role: 'admin' }),
    check('name').matches(usernameRegex),
    check('id').isNumeric(),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const data = req.locals.data;
    await Server.sys.user.addRole(data.name, data.id);
    res.status(200).end();
}));

// Remove role
router.delete('/id/:name/role/:id', [
    middleware.authentication,
    middleware.authorization({ role: 'admin' }),
    check('name').matches(usernameRegex),
    check('id').isNumeric(),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const data = req.locals.data;
    await Server.sys.user.removeRole(data.name, data.id);
    res.status(200).end();
}));

// Update software
router.put('/id/:name/software/:id', [
    middleware.authentication,
    check('name').matches(usernameRegex),
    check('id').isNumeric(),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    throw new Server.errors.NotImplemented();
}));

// Update color
router.put('/id/:name/color/:color', [
    middleware.authentication,
    middleware.authorization({ role: 'color' }),
    check('name').matches(usernameRegex),
    check('color').matches(/^[0-9a-f]{6}$/),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    throw new Server.errors.NotImplemented();
}));


// Generate new access key
router.post('/reset_key', (req, res) => {
    throw new Server.errors.NotImplemented();
});

module.exports = router;
