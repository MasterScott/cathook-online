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

    async storeUser(username, password, referrer, mail, api_key, software_id)
    {
        await this.client.query('INSERT INTO users (username, password_hash, referrer, mail, api_key, software_id) VALUES ($1, $2, $3, $4, $5, $6)', [username, password, referrer, mail, api_key, software_id]);
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
        await this.client.query('UPDATE steamid SET user_id = $1, first_used = NOW() WHERE steam3 = $2', [userId, steamId]);
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

    async setUserColor(username, color)
    {
        await this.client.query('UPDATE users SET color = $1 WHERE username = $2', [color, username]);
    }

    /* SteamID */

    async getUserSteamIdList(username, start, count)
    {
        const result = await this.client.query(
            `SELECT steamid.* FROM steamid
            INNER JOIN users ON steamid.user_id = users.id
            WHERE users.username = $1
            ORDER BY first_used DESC
            LIMIT $2 OFFSET $3`, [username, count, start]);
        return result.rows;
    }

    async updateSteamIdLastLogin(steam3)
    {
        await this.client.query(`UPDATE steamid SET last_used = NOW() WHERE steam3 = $1`, [steam3]);
    }

    async setSteamVerified(steamId, verified)
    {
        const result = await this.client.query(`UPDATE steamid SET verified = $2 WHERE steam3 = $1`, [steamId, verified]);
        return !!result.rowCount;
    }

    async deleteSteamId(steamId)
    {
        const result = await this.client.query('DELETE FROM steamid WHERE steam3 = $1', [steamId]);
        return !!result.rowCount;
    }

    async deleteSteamIdIfBelongsToUser(steamId, username)
    {
        const result = await this.client.query(
            `DELETE FROM steamid 
            WHERE steam3 = $1 AND user_id IN (SELECT users.id FROM users WHERE username = $2)`, [steamId, username]);
        return !!result.rowCount;
    }

    /* USER-SOFTWARE */

    async setUserSoftware(username, software_id)
    {
        await this.client.query('UPDATE users SET software_id = $1 WHERE username = $2', [software_id, username]);
    }

    /* USER-GROUP */

    async checkAnyOfGroups(username, groups)
    {
        const result = await this.client.query(
            `SELECT 1 FROM usergroups 
            INNER JOIN groups ON groups.id = usergroups.group_id 
            INNER JOIN users ON users.id = usergroups.user_id 
            WHERE groups.name = ANY ($1) AND users.username = $2`, [groups, username]);
        return !!result.rowCount;
    }

    async checkUserGroup(username, group)
    {
        const result = await this.client.query(
            `SELECT 1 FROM usergroups 
            INNER JOIN groups ON groups.id = usergroups.group_id
            INNER JOIN users ON users.id = usergroups.user_id
            WHERE groups.name = $1 AND users.username = $2`, [group, username]);
        return !!result.rowCount;
    }

    async addUserGroup(username, group)
    {
        await this.client.query(
            `INSERT INTO usergroups (group_id, user_id) VALUES(
                (SELECT groups.id FROM groups WHERE name = $1),
                (SELECT users.id FROM users WHERE username = $2))`, [group, username]);
    }

    async deleteUserGroup(username, group)
    {
        const result = await this.client.query(
            `DELETE FROM usergroups 
            WHERE group_id IN (SELECT groups.id FROM groups WHERE name = $1) 
            AND user_id IN (SELECT users.id FROM users WHERE username = $2)`, [group, username]);
        return !!result.rowCount;
    }

    async getUserGroups(username)
    {
        const result = await this.client.query(
            `SELECT * FROM groups 
            INNER JOIN usergroups ON usergroups.group_id = groups.id 
            INNER JOIN users ON users.id = usergroups.user_id
            WHERE users.username = $1`, [username]);
        return result.rows;
    }

    /* group */

    async checkGroupExists(name)
    {
        const result = await this.client.query('SELECT 1 FROM groups WHERE name = $1 LIMIT 1', [name]);
        return !!result.rowCount;
    }

    async createGroup(name, display)
    {
        await this.client.query('INSERT INTO groups (name, display) VALUES ($1, $2)', [name, display]);
    }

    async deleteGroup(id)
    {
        const result = await this.client.query('DELETE FROM groups WHERE name = $1', [id]);
        return !!result.rowCount;
    }

    async getAllGroups()
    {
        const result = await this.client.query('SELECT * FROM groups');
        return result.rows;
    }

    async getGroup(id)
    {
        const result = await this.client.query('SELECT * FROM groups WHERE id = $1 LIMIT 1', [id]);
        return result[0];
    }

    async getGroupId(name)
    {
        const result = await this.client.query('SELECT id FROM groups WHERE name = $1 LIMIT 1', [name]);
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

    async checkSoftwareIdExists(id)
    {
        const result = await this.client.query('SELECT 1 FROM software WHERE id = $1 LIMIT 1', [id]);
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

    // STATS

    async getCountStats()
    {
        console.log('stats');
        const result = await this.client.query(`SELECT
            (SELECT COUNT(1) FROM users) AS users,
            (SELECT COUNT(1) FROM steamid) AS steamid,
            (SELECT COUNT(1) FROM invites) AS invites`);
        return result.rows[0];
    }
}

module.exports = DbInterface;
