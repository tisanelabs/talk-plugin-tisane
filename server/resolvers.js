const get = require('lodash/get');

module.exports = {
  Comment: {
    toxicity: comment =>
      // The Metadata is a field of Comment model, use this lodash 'get' method to retreive the 
      // data as it is save in the Field
      get(
        comment,
        `metadata.perspective.TOXICITY.AbuseLevel`,
        0
      ),
  },
};
