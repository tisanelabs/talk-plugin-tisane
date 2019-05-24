const { readFileSync } = require('fs');
const path = require('path');
const hooks = require('./server/hooks');
const resolver = require('./server/resolvers');
const tags = require('./server/tags');

module.exports = {
  typeDefs: readFileSync(
    path.join(__dirname, 'server/typeDefs.graphql'),
    'utf8'
  ),
  hooks,
  resolver,
  tags
};
