const express = require('express');
const app = express();
const Server = require('./app/Server');

require('./app/app')(app);

const port = process.env.PORT || 8000;

const f = async () => {
    await Server.db.init();
    app.listen(port, () => {
        Server.logger.info(`Listening on ${port}`);
    });
}

f();
