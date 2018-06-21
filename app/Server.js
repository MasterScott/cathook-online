'use strict';

let Server = {
    logger: null,
    db: null,
    sys: null
};

module.exports = Server;

Server.sys = {
    user: require('./internal/user'),
    invite: require('./internal/invite'),
    game: require('./internal/game')
}

const winston = require('winston');
const DbInterface = require('./database');

winston.level = 'debug';
Server.logger = winston;
Server.db = new DbInterface();
