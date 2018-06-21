'use strict';

const Server = require('../Server');
const crypto = require('crypto');

const MAX_INVITES = 10;

module.exports = {
    createInvite: async function createInvite(user)
    {
        const count = await Server.db.getInviteCount(user.id);
        if (count >= MAX_INVITES)
            throw new Error(`You cannot have more than ${MAX_INVITES} at once`);
        const key = crypto.randomBytes(8).toString('hex');
        await Server.db.storeInvite(user.id, key);
        return key;
    },
    getInvites: async function getInvites(user)
    {
        const invites = await Server.db.getInvites(user.id);
        const result = [];
        for (i of invites)
        {
            result.push({
                key: i.value
            })
        }
        return result;
    }
}
