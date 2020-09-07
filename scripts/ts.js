'use strict'

var tsify = require('tsify')
var browserify = require('browserify')

function streamToString (stream) {
    const chunks = []
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk))
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
}

async function ts_renderer(data, options) {
    return await streamToString(browserify({debug: true})
        .add(data.path)
        .plugin(tsify, {})
        .bundle()
        .on('error', function (error) { console.error(error.toString()); }));
}

hexo.extend.renderer.register('ts', 'js', ts_renderer, false)

