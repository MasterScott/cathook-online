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
        {
            // Successfully logged in
            const groups = await Server.sys.user.getGroups(user.username);
            return {
                api_key: user.api_key,
                username: user.username,
                groups: groups.map(group => {
                    return {
                        name: group.name,
                        display: group.display
                    }
                })
            };
        }
        throw new Server.errors.Unauthorized('Bad credentials');
    },
    info: function info(raw) {
        return {
            username: raw.username,
            registered_ts: raw.registered_ts,
            color: raw.color
        }
    },
    hasGroup: async function hasGroup(userId, groupId)
    {
        const groupExists = await Server.db.checkGroupIdExists(groupId);
        if (!groupExists)
        throw new Server.errors.NotFound('Group does not exist');
        return await Server.db.checkUserGroup(userId, groupId);
    },
    addGroup: async function addGroup(username, groupId)
    {
        const userId = await Server.db.getUserId(username);
        const groupExists = await Server.db.checkGroupIdExists(groupId);
        if (!groupExists)
            throw new Server.errors.NotFound('Group does not exist');
        const has = await this.hasGroup(userId, groupId);
        if (has)
            throw new Server.errors.Conflict('User already has group');
        Server.db.addUserGroup(userId, groupId);    
    },
    removeGroup: async function removeGroup(username, groupId)
    {
        const groupExists = await Server.db.checkGroupIdExists(groupId);
        if (!groupExists)
            throw new Server.errors.NotFound('Group does not exist');
        const userId = await Server.db.getUserId(username);
        const had = await Server.db.deleteUserGroup(userId, groupId);
        if (!had)
            throw new Server.errors.NotFound('User does not have group');
    },
    getGroups: async function getGroups(username) 
    {
        const userId = await Server.db.getUserId(username);
        const groups = await Server.db.getUserGroups(userId);
        return groups;
    }
};
