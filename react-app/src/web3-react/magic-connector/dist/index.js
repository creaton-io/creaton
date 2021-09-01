
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./magic-connector.cjs.production.min.js')
} else {
  module.exports = require('./magic-connector.cjs.development.js')
}
