const path = require('path')
const options = {
    entry: './example/entry.js',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
    },
    module: {
        rules: []
    }
}

module.exports = options