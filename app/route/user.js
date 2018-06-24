'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const middleware = require('../middleware')

const Server = require('../Server');

const usernameRegex = /^[0-9_a-z\-]{3,32}$/i;
const passwordRegex = /^[0-9a-f]{64}$/;
const groupRegex = /^[0-9a-z_]{3,32}$/;
const colorRegex = /^[0-9a-f]{6}$/;

// Show your own info
router.get('/me', [ 
    middleware.authentication
], (req, res) => {
    res.status(200).json(Server.sys.user.info(req.locals.user));
});

// Register a new user
router.post('/register', [
    check('username').matches(usernameRegex).withMessage('Username must be between 3 and 32 characters long, allowed characters: 0-9, a-z, _ and -'),
    check('password').matches(passwordRegex),
    check('invite').isLength({ max: 255 }),
    check('mail').isLength({ max: 255 }).isEmail(),
    check('software').optional().isNumeric(),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const key = await Server.sys.user.register(req.locals.data);
    res.status(201).end(key);
}));

// Get user info
router.get('/id/:name', [
    check('name').matches(usernameRegex),
    middleware.passedAllChecks,
    middleware.authentication
], wrap(async function(req, res) {
    const user = await Server.db.getUserByUsername(req.locals.data.name);
    
    const sw = await Server.sys.software.getSoftware(user.software_id);
    const groups = await Server.sys.user.getGroups(req.locals.data.name);

    const result = {
        username: user.username,
        registered_at: user.registered_at,
        software: sw ? sw.name : null,
        color: user.color,
        groups: groups.map(group => {
            return {
                name: group.name,
                display: group.display
            }
        })
    };

    res.status(200).json(result);
}));

// Get user by Steam ID
router.get('/steam/:steam', [
    check('steam').matches(/^\d{1,10}$/),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const user = await Server.db.getUserBySteamId(req.locals.data.steam);
    if (user)
    {
        const groups = await Server.sys.user.getGroups(user.username);
        const software = await Server.sys.software.getSoftware(user.software_id);
        res.status(200).json({
            username: user.username,
            verified: user.verified,
            color: user.color,
            groups: groups.map(group => {
                return {
                    name: group.name,
                    display: group.display
                }
            }),
            software: software == null ? null : {
                name: software.name,
                friendly: software.friendly
            }
        });
    }
    else
        throw new Server.errors.NotFound();
}));

// Return access key + user data
router.post('/login', [
    check('username').matches(usernameRegex),
    check('password').matches(passwordRegex),
    middleware.passedAllChecks
], wrap(async function(req, res) {
    const data = await Server.sys.user.login(req.locals.data.username, req.locals.data.password);
    if (data == null)
        throw new Server.errors.InternalServerError();
    else
        res.status(200).json(data);
}));

// Add user group
router.post('/id/:name/group/:group', [
    check('name').matches(usernameRegex),
    check('group').matches(groupRegex),
    middleware.passedAllChecks,
    middleware.authentication,
    middleware.notAnonymous,
    middleware.authorization()
], wrap(async function(req, res) {
    const data = req.locals.data;
    await Server.sys.user.addGroup(data.name, data.group);
    res.status(200).end();
}));

// Remove group
router.delete('/id/:name/group/:group', [
    check('name').matches(usernameRegex),
    check('group').matches(groupRegex),
    middleware.passedAllChecks,
    middleware.authentication,
    middleware.notAnonymous,
    middleware.authorization()
], wrap(async function(req, res) {
    const data = req.locals.data;
    await Server.sys.user.removeGroup(data.name, data.group);
    res.status(200).end();
}));

// Update software
router.put('/id/:name/software/:id', [
    check('name').matches(usernameRegex),
    check('id').isNumeric(),
    middleware.passedAllChecks,
    middleware.authentication,
    middleware.notAnonymous
], wrap(async function(req, res) {
    const data = req.locals.data;
    const is_admin = await Server.sys.user.isAdmin(req.locals.user.username);
    if (data.name != req.locals.user.username && !is_admin)
        throw new Server.errors.Forbidden('You cannot change other user settings');
    await Server.sys.user.setSoftware(data.name, data.id);
    res.status(200).end();
}));

// Delete software
router.delete('/id/:name/software', [
    check('name').matches(usernameRegex),
    middleware.passedAllChecks,
    middleware.authentication,
    middleware.notAnonymous
], wrap(async function(req, res) {
    const data = req.locals.data;
    const is_admin = await Server.sys.user.isAdmin(req.locals.user.username);
    if (data.name != req.locals.user.username && !is_admin)
        throw new Server.errors.Forbidden('You cannot change other user settings');
    await Server.sys.user.setSoftware(data.name, null);
    res.status(200).end();
}));

// Update color
router.put('/id/:name/color/:color', [
    check('name').matches(usernameRegex),
    check('color').matches(colorRegex),
    middleware.passedAllChecks,
    middleware.authentication,
    middleware.notAnonymous,
    middleware.authorization({ groups: ['color'] })
], wrap(async function(req, res) {
    const data = req.locals.data;
    const is_admin = await Server.sys.user.isAdmin(req.locals.user.username);
    if (data.name != req.locals.user.username && !is_admin)
        throw new Server.errors.Forbidden('You cannot change other user settings');
    await Server.sys.user.setColor(data.name, data.color);
    res.status(200).end();
}));

// Delete color
router.delete('/id/:name/color', [
    check('name').matches(usernameRegex),
    middleware.passedAllChecks,
    middleware.authentication,
    middleware.notAnonymous,
    middleware.authorization({ groups: ['color'] })
], wrap(async function(req, res) {
    const data = req.locals.data;
    const is_admin = await Server.sys.user.isAdmin(req.locals.user.username);
    if (data.name != req.locals.user.username && !is_admin)
        throw new Server.errors.Forbidden('You cannot change other user settings');
    await Server.sys.user.setColor(data.name, null);
    res.status(200).end();
}));

// Get a range of SteamIDs associated with user
router.get('/id/:name/steam/:start/:count', [
    check('name').matches(usernameRegex),
    check('start').isNumeric(),
    check('count').isNumeric(),
    middleware.passedAllChecks,
    middleware.authentication,
    middleware.notAnonymous    
], wrap(async function(req, res) {
    const data = req.locals.data;
    if (data.start < 0 || data.count < 0)
        throw new Server.errors.BadRequest('Positive numbers expected');
    if (data.count > 50)
        throw new Server.errors.BadRequest('count should not be more than 50');
    const can_see = await Server.db.checkAnyOfGroups(req.locals.user.username, ['admin', 'can_verify']);
    if (data.name != req.locals.user.username && !can_see)
        throw new Server.errors.Forbidden();
    const list = await Server.db.getUserSteamIdList(data.name, data.start, data.count);
    res.status(200).json(list.map(s => {
        return {
            first_used: s.first_used,
            last_used: s.last_used,
            steam3: s.steam3,
            verified: s.verified
        }
    }));
}));

// Generate new access key
router.post('/reset_key', (req, res) => {
    throw new Server.errors.NotImplemented();
});

module.exports = router;
