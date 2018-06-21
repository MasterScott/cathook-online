'use strict';

const Server = require('../Server');

module.exports = {
    getUserRoles: async function getUserRoles(user)
    {
        const roles = await Server.db.getRoles(user.id);
        return roles;
    },
    // Modifies "user.roles"
    userHasRole: async function userHasRole(user, name)
    {
        if (!user.hasOwnProperty('roles'))
            user.roles = await this.getUserRoles(user);
        for (i of user.roles)
            if (i.name == name)
                return true;
        return false;
    },
    getAllRoles: async function getAllRoles()
    {
        const allRoles = await Server.db.getAllRoles();
        return allRoles;
    },
    createRole: async function createRole(name, displayName)
    {
        const exists = await Server.db.checkRoleExists(name);
        if (exists)
            throw new Server.errors.Conflict('Role exists');
        await Server.db.createRole(name, displayName);
    },
    deleteRole: async function deleteRole(name)
    {
        const result = await Server.db.deleteRoleAndUserRoles(name);
        if (!result)
            throw new Server.errors.NotFound('Role does not exist');
    }
};