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
            if (!user.anonymous && claim.username == 'anonymous')
                await Server.db.reclaimSteamId(user.id, steamId);
            else
                throw new Error('SteamID already claimed');
        }
    },
    identify: async function identify(list)
    {
        const data = await Server.db.getUsersFromSteamIDs(list);
        console.log(data);
        for (i in data)
        {
            data[i] = {
                steam3: data[i].steam3,
                verified: data[i].verified,
                username: data[i].username,
                color: data[i].color,
                roles: []
            }
        }
        return data;
    }
}
