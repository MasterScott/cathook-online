'use strict';

const Server = require('../Server');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = {
    register: async function register(data)
    {
        const userExists = await Server.db.checkUserExists(data.username);
        if (userExists)
            throw new Server.errors.Conflict('Username taken');
        const invite = await Server.db.consumeInvite(data.invite);
        if (!invite)
            throw new Server.errors.NotFound('Invite does not exist');

        const password = await bcrypt.hash(data.password, 10);
        const api_key = crypto.randomBytes(16).toString('hex');

        await Server.db.storeUser(data.username, password, invite.referrer, data.mail, api_key);
    },
    login: async function login(username, password)
    {
        const user = await Server.db.getUserByUsername(username);
        if (user == null)
            throw new Server.errors.NotFound('User not registered');
        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (passwordMatches)
            return user.api_key;
        throw new Server.errors.Unauthorized('Bad credentials');
    },
    info: function info(raw) {
        return {
            username: raw.username,
            registered_ts: raw.registered_ts,
            color: raw.color,
            mail_confirmed: raw.mail_confirmed
        }
    }
};
