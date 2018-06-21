'use strict';

const Server = require('../Server');

module.exports = {
    getAllRoles: async function getAllRoles()
    {
        const allRoles = await Server.db.getAllRoles();
        return allRoles;
    },
    create: async function create(name, displayName)
    {
        const exists = await Server.db.checkRoleExists(name);
        if (exists)
            throw new Server.errors.Conflict('Role exists');
        await Server.db.createRole(name, displayName);
    },
    delete: async function deleteRole(id)
    {
        const result = await Server.db.deleteRole(id);
        if (!result)
            throw new Server.errors.NotFound('Role does not exist');
    }
};