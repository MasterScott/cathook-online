'use strict';

const DbInterface = require('./database');

const Server = {
    logger: null,
    db: new DbInterface(),
    sys: {
        user: null,
        invite: null,
        game: null,
        role: null
    },
    config: require('../config'),
    errors: require('./errors')
};

module.exports = Server;

Server.sys.user = require('./internal/user'),
Server.sys.invite = require('./internal/invite'),
Server.sys.game = require('./internal/game'),
Server.sys.role = require('./internal/role')


const winston = require('winston');

winston.level = 'debug';
Server.logger = winston;
