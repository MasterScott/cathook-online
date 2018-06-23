'use strict';

const router = require('express').Router();
const wrap = require('async-middleware').wrap;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const middleware = require('../middleware');
const Server = require('../Server');

// Set current SteamID and stuff
router.post('/startup', [
    check('steam').matches(/^\d{1,10}$/),
    middleware.authentication,
    middleware.passedAllChecks
], wrap(async function(req, res) {
    await Server.sys.game.claimSteamId(req.locals.user, req.locals.data.steam);
    res.status(200).end();
}));

// Identify array of SteamIDs (separated by ,)
router.get('/identify', [
    check('ids').matches(/^(\d{1,10},?)+$/),
    middleware.authentication,
    middleware.passedAllChecks
], (async function (req, res) {
    const ids = req.locals.data.ids.split(',');
    if (ids.length > 32)
        throw new Server.errors.PayloadTooLarge();
    const identified = await Server.sys.game.identify(ids);
    // Only send public data
    const result = {};
    for (const i of identified)
    {
        result[i.user.steam3] = {
            username: i.user.username,
            verified: i.user.verified,
            color: i.user.color,
            groups: i.groups.map(group => {
                return {
                    name: group.name,
                    display: group.display
                }
            }),
            software: i.software == null ? null : {
                name: i.software.name,
                friendly: i.software.friendly
            }
        };
    }
    res.status(200).json(result);
}));

// Store stats (kills, etc) on round end
router.post('/store', (req, res) => {
    throw new Server.errors.NotImplemented();
});

// Keep the user online/ingame/etc status
router.post('/online', (req, res) => {
    throw new Server.errors.NotImplemented();
});

module.exports = router;
