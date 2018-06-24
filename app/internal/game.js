'use strict';

const wrap = require('async-middleware').wrap;
const Server = require('../Server');

module.exports = {
    claimSteamId: async function claimSteamId(user, steamId)
    {
        const claim = await Server.db.getUserBySteamId(steamId);
        if (claim == null)
        {
            await Server.db.claimSteamId(steamId, user.id);
        }
        else
        {
            if (claim.user == user.id) {
                await Server.db.updateSteamIdLastLogin(steamId);
                return;
            }
            if (!user.anonymous && claim.username == Server.config.anonymousAccount)
                await Server.db.reclaimSteamId(steamId, user.id);
            else
                throw new Server.errors.Conflict();
        }
    },
    identify: async function identify(list)
    {
        const data = await Server.db.getUsersFromSteamIDs(list);
        for (const i in data)
        {
            data[i] = {
                user: data[i],
                groups: await Server.sys.user.getGroups(data[i].username),
                software: await Server.sys.software.getSoftware(data[i].software_id)
            }
        }
        return data;
    },
    verify: async function verify(steamId)
    {
        const affected = await Server.db.setSteamVerified(steamId, true);
        if (!affected)
            throw new Server.errors.NotFound('SteamID not found');
    },
    unverify: async function unverify(steamId)
    {
        const affected = await Server.db.setSteamVerified(steamId, false);
        if (!affected)
            throw new Server.errors.NotFound('SteamID not found');
    },
    deleteSteamId: async function deleteSteamId(steamId)
    {
        const affected = await Server.db.deleteSteamId(steamId);
        if (!affected)
            throw new Server.errors.NotFound('SteamID not found');
    },
    deleteSteamIdIfBelongsToUser: async function deleteSteamIdIfBelongsToUser(steamId, username)
    {
        const affected = await Server.db.deleteSteamIdIfBelongsToUser(steamId, username);
        if (!affected)
            throw new Server.errors.NotFound('SteamID not found');
    } 
}
