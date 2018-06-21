'use strict';

const bodyparser = require('body-parser');
const express = require('express');
const path = require('path');
const cors = require('cors');
const errorHandler = require('./errorHandler');

module.exports = (app) => {
    app.use(errorHandler);
    app.use(cors({ origin: '*' }));
    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({ extended: true }));

    app.use('/game', require('./route/game'));
    app.use('/invite', require('./route/invite'));
    app.use('/user', require('./route/user'));
}
