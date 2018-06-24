'use strict';

const Server = require('../Server');

module.exports = {
    getAllGroups: async function getAllGroups()
    {
        const allGroups = await Server.db.getAllGroups();
        return allGroups;
    },
    create: async function create(options)
    {
        const exists = await Server.db.checkGroupExists(options.name);
        if (exists)
            throw new Server.errors.Conflict('Group exists');
        await Server.db.createGroup(options.name, options.display);
    },
    delete: async function deleteGroup(id)
    {
        const result = await Server.db.deleteGroup(id);
        if (!result)
            throw new Server.errors.NotFound('Group does not exist');
    }
};