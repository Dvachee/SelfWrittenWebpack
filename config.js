module.exports = {
    entry: './example/entry.js',
    out: __dirname + '/dist',
    sourceDirectory: './example',
    html: './example/index.html',
    server: {
        port: 3000,
        host: 'localhost',
    }
};