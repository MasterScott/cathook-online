'use strict';

const { Client } = require('pg');
const config = require('../config');

class DbInterface
{
    async init()
    {
        this.client = new Client({
            user: config.db.username,
            password: config.db.password,
            database: config.db.name,
            host: 'localhost'
        });
        this.client.connect();
    }

    async getInviteCount(userId)
    {
        const result = await this.client.query('SELECT 1 FROM invites WHERE created_by = $1', [userId]);
        return result.rowCount;
    }

    async storeInvite(userId, key)
    {
        await this.client.query('INSERT INTO invites (created_by, value) VALUES ($1, $2)', [userId, key]);
    }

    async getInvites(userId)
    {
        const result = await this.client.query('SELECT * FROM invites WHERE created_by = $1', [userId]);
        return result.rows;
    }

    async checkUserExists(username)
    {
        const result = await this.client.query('SELECT 1 FROM users WHERE username = $1 LIMIT 1', [username]);
        return result.rowCount != 0;
    }

    async consumeInvite(key)
    {
        const result = await this.client.query('DELETE FROM invites WHERE value = $1 RETURNING created_by', [key]);
        if (result.rowCount != 0)
            return { referrer: result.rows[0].created_by };
        else
            return null;
    }

    async storeUser(username, password, referrer, mail, api_key)
    {
        await this.client.query('INSERT INTO users (username, password_hash, referrer, mail, api_key) VALUES ($1, $2, $3, $4, $5)', [username, password, referrer, mail, api_key]);
    }

    async getUserByUsername(username)
    {
        const result = await this.client.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
        return result.rows[0];
    }

    async getUserBySteamId(steamId)
    {
        const result = await this.client.query('SELECT * FROM steamid INNER JOIN users ON steamid.user = users.id WHERE steamid.steam3 = $1 LIMIT 1', [steamId]);
        return result.rows[0];
    }

    async reclaimSteamId(steamId, userId)
    {
        await this.client.query('UPDATE steamid SET "user" = $1, added_at = NOW() WHERE steam3 = $2 LIMIT 1', [userId, steamId]);
    }

    async claimSteamId(steamId, userId)
    {
        console.log(steamId, userId);
        await this.client.query('INSERT INTO steamid ("user", steam3) VALUES ($1, $2)', [userId, steamId]);
    }

    async getUsersFromSteamIDs(list)
    {
        const result = await this.client.query('SELECT * FROM steamid INNER JOIN users ON steamid."user" = users.id WHERE steamid.steam3 = ANY ($1::int[])', [list]);
        return result.rows;
    }

    async getUserIdFromKey(key)
    {
        const result = await this.client.query('SELECT id FROM users WHERE api_key = $1 LIMIT 1', [key]);
        if (result.rows.length !== 1)
            return null;
        return result.rows[0].id;
    }

    async getUserFromKey(key)
    {
        const result = await this.client.query('SELECT EXTRACT(EPOCH FROM registered_at) AS registered_ts,users.* FROM users WHERE api_key = $1 LIMIT 1', [key]);
        if (result.rowCount !== 1)
            return null;
        return result.rows[0];
    }
}

module.exports = DbInterface;
