'use strict';

const DbInterface = require('./database');

const Server = {
    logger: null,
    db: new DbInterface(),
    sys: {
        user: null,
        invite: null,
        game: null,
        group: null,
        software: null
    },
    config: require('../config'),
    errors: require('./errors')
};

module.exports = Server;

Server.sys.user = require('./internal/user');
Server.sys.invite = require('./internal/invite');
Server.sys.game = require('./internal/game');
Server.sys.group = require('./internal/group');
Server.sys.software = require('./internal/software');

const winston = require('winston');

winston.level = 'debug';
Server.logger = winston;
