'use strict';

module.exports = {
    authentication: require('./mw/authentication'),
    authorization: require('./mw/authorization'),
    ratelimit: require('./mw/ratelimit')
}
