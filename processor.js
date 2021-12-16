const postcss = require('postcss')
const loader = require('postcss-load-config')

const loaderPromises = {}

module.exports = function processor(src, options) {
  options = options || {}

  const loaderPromise = loaderPromises.hasOwnProperty(options.path || 'auto')
    ? loaderPromises[options.path || 'auto']
    : loader({env: options.env || process.env, ...(options.pluginOptions||{})}, options.path, {
        argv: false
      }).then((pluginsInfo) => pluginsInfo.plugins || [])

  loaderPromises[options.path || 'auto'] = loaderPromise

  return loaderPromise
    .then((plugins) => postcss(plugins).process(src, { 
      from: (options.babel || {}).filename || "unknown filename", 
      ...(options.processOptions || {})
    }))
    .then((result) => result.css)
}
