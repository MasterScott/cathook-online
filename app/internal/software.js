'use strict';

const Server = require('../Server');

module.exports = {
    getAllSoftware: async function getAllSoftware()
    {
        const allSoftware = await Server.db.getAllSoftware();
        return allSoftware;
    },
    create: async function create(options)
    {
        const exists = await Server.db.checkSoftwareExists(options.name);
        if (exists)
            throw new Server.errors.Conflict('Software exists');
        await Server.db.createSoftware(options.name, options.developers, options.url);
    },
    delete: async function deleteSoftware(id)
    {
        const result = await Server.db.deleteSoftware(id);
        if (!result)
            throw new Server.errors.NotFound('Software does not exist');
    }
};