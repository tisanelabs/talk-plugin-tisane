const { TalkError } = require('errors');

// ErrToxic is sent during a `CreateComment` mutation where
// `input.checkToxicity` is set to true and the comment contains
// toxic language as determined by the perspective service.
class ErrToxic2 extends TalkError {
  constructor() {
    super('Your Comment is toxic to the Community, please rethink this Statement and Consider changing it', {
      status: 400,
      translation_key: 'COMMENT_IS_MOD',
    });
  }
}

module.exports = {
  ErrToxic2,
};
