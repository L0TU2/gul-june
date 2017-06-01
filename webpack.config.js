const path = require('path')
module.exports = {
    entry: { bundle: './app/main.js' },
    output: {
        path: path.resolve(__dirname, './app/wpk'),
        filename: '[name].js'
    }
};