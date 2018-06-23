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
        await this.client.query('INSERT INTO invites (created_by, key) VALUES ($1, $2)', [userId, key]);
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
        const result = await this.client.query('DELETE FROM invites WHERE key = $1 RETURNING created_by', [key]);
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
        const result = await this.client.query('SELECT * FROM steamid INNER JOIN users ON steamid.user_id = users.id WHERE steamid.steam3 = $1 LIMIT 1', [steamId]);
        return result.rows[0];
    }

    async reclaimSteamId(steamId, userId)
    {
        await this.client.query('UPDATE steamid SET "user" = $1, added_at = NOW() WHERE steam3 = $2 LIMIT 1', [userId, steamId]);
    }

    async claimSteamId(steamId, userId)
    {
        await this.client.query('INSERT INTO steamid (user_id, steam3) VALUES ($1, $2)', [userId, steamId]);
    }

    async getUsersFromSteamIDs(list)
    {
        const result = await this.client.query('SELECT * FROM steamid INNER JOIN users ON steamid.user_id = users.id WHERE steamid.steam3 = ANY ($1::int[])', [list]);
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

    async getUserId(username)
    {
        const result = await this.client.query('SELECT id FROM users WHERE username = $1', [username]);
        if (result.rowCount == 0)
            return null;
        return result.rows[0].id;
    }

    /* USER-ROLE */

    async checkUserRole(userId, roleId)
    {
        const result = await this.client.query('SELECT 1 FROM userroles WHERE user_id = $1 AND role_id = $2 LIMIT 1', [userId, roleId]);
        return !!result.rowCount;
    }

    async addUserRole(userId, roleId)
    {
        await this.client.query('INSERT INTO userroles (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);
    }

    async deleteUserRole(userId, roleId)
    {
        const result = await this.client.query('DELETE FROM userroles WHERE user_id = $1 AND role_id = $2', [userId, roleId]);
        return !!result.rowCount;
    }

    async getUserRoles(userId)
    {
        const result = await this.client.query('SELECT * FROM roles INNER JOIN userroles ON userroles.role_id = roles.id WHERE userroles.user_id = $1', [userId]);
        return result.rows;
    }

    /* ROLE */

    async checkRoleExists(name)
    {
        const result = await this.client.query('SELECT 1 FROM roles WHERE name = $1 LIMIT 1', [name]);
        return !!result.rowCount;
    }

    async checkRoleIdExists(id)
    {
        const result = await this.client.query('SELECT 1 FROM roles WHERE id = $1 LIMIT 1', [id]);
        return !!result.rowCount;
    }

    async createRole(name, display)
    {
        const result = await this.client.query('INSERT INTO roles (name, display) VALUES ($1, $2) RETURNING id', [name, display]);
        if (!result.rowCount)
            return null;
        return result.rows[0].id;
    }

    async deleteRole(id)
    {
        const result = await this.client.query('DELETE FROM roles WHERE name = $1', [id]);
        return !!result.rowCount;
    }

    async getAllRoles()
    {
        const result = await this.client.query('SELECT * FROM roles');
        return result.rows;
    }

    async getRole(id)
    {
        const result = await this.client.query('SELECT * FROM roles WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    }

    async getRoleId(name)
    {
        const result = await this.client.query('SELECT id FROM roles WHERE name = $1 LIMIT 1', [name]);
        if (result.rowCount !== 1)
            return null;
        return result.rows[0].id;
    }

    /* SOFTWARE */

    async checkSoftwareExists(name)
    {
        const result = await this.client.query('SELECT 1 FROM software WHERE name = $1 LIMIT 1', [name]);
        return !!result.rowCount;
    }

    async createSoftware(name, developers, url)
    {
        const result = await this.client.query('INSERT INTO software (name, developers, url) VALUES ($1, $2, $3) RETURNING id', [name, developers, url]);
        if (result.rowCount !== 1)
            return null;
        return result.rows[0].id;
    }

    async deleteSoftware(id)
    {
        const result = await this.client.query('DELETE FROM software WHERE id = $1', [id]);
        return !!result.rowCount;
    }

    async getAllSoftware()
    {
        const result = await this.client.query('SELECT * FROM software');
        return result.rows;
    }

    async getSoftware(id)
    {
        const result = await this.client.query('SELECT * FROM software WHERE id = $1 LIMIT 1', [id]);
        return result.rows[0];
    }

    async getSoftwareId(name)
    {
        const result = await this.client.query('SELECT id FROM software WHERE name = $1 LIMIT 1', [name]);
        if (result.rowCount !== 1)
            return null;
        return result.rows[0].id;
    }

}

module.exports = DbInterface;
