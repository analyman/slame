'use strict'

var sass   = require('sass')
var extend = require('util')._extend

var sassRenderer = (ext) => function (data) {
    // support global and theme-specific config
    var userConfig = extend(
        this.theme.config.node_sass || {},
        this.config.node_sass || {}
    )

    var config = extend({
        data: data.text,
        file: data.path,
        outputStyle: 'expanded',
        sourceComments: true,
        indentedSyntax: (ext === 'sass')
    }, userConfig)

    try {
        var result = sass.renderSync(config)
        return result.css.toString()
    } catch (error) {
        console.error(error.toString())
        throw error
    }
}

hexo.extend.renderer.register('scss', 'css', sassRenderer('scss'))
hexo.extend.renderer.register('sass', 'css', sassRenderer('sass'))

