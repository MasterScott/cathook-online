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
            if (claim.user == user.id)
                return;
            if (!user.anonymous && claim.username == Server.config.anonymousAccount)
                await Server.db.reclaimSteamId(user.id, steamId);
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
                roles: await Server.sys.user.getRoles(data[i].username),
                software: await Server.sys.software.getSoftware(data[i].software_id)
            }
        }
        return data;
    }
}
