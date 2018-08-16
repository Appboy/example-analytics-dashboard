const basicAuth = require('basic-auth');
const defaultConfig = require('../default_config');
const accessName = process.env.USER_NAME || defaultConfig.USER_NAME
const accessPassword = process.env.PASSWORD || defaultConfig.PASSWORD

module.exports.BasicAuthentication = function(request, response, next) {
    function unauthorized(response) {
        response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return response.send(401);
    };

    var user = basicAuth(request);

    if (!user || !user.name || !user.pass) {
        return unauthorized(response);
    };

    if (user.name === accessName && user.pass === accessPassword) {
        return next();
    } else {
        return unauthorized(response);
    };
};
