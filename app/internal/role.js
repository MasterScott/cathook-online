'use strict';

const Server = require('../Server');

module.exports = {
    getAllRoles: async function getAllRoles()
    {
        const allRoles = await Server.db.getAllRoles();
        return allRoles;
    },
    create: async function create(options)
    {
        const exists = await Server.db.checkRoleExists(options.name);
        if (exists)
            throw new Server.errors.Conflict('Role exists');
        await Server.db.createRole(options.name, options.display);
    },
    delete: async function deleteRole(id)
    {
        const result = await Server.db.deleteRole(id);
        if (!result)
            throw new Server.errors.NotFound('Role does not exist');
    },
    getId: async function getId(name)
    {
        const result = await Server.db.getRoleId(name);
        if (result === null)
            throw new Server.errors.NotFound('Role does not exist');
        return result;
    }
};