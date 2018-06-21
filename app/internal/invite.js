'use strict';

const Server = require('../Server');
const crypto = require('crypto');

module.exports = {
    createInvite: async function createInvite(user)
    {
        const count = await Server.db.getInviteCount(user.id);
        if (count >= Server.config.maxInvites)
            throw new Server.errors.TooManyRequests(`You can only have ${Server.config.maxInvites} at once`);
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
