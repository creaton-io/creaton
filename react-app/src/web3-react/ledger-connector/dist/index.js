
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./ledger-connector.cjs.production.min.js')
} else {
  module.exports = require('./ledger-connector.cjs.development.js')
}
