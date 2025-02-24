const path = require('path');

module.exports = function (config) {
    config.output.path = path.join(__dirname, 'dist');
    return config;
};