const { TalkError } = require('errors');

// ErrToxic is sent during a `CreateComment` mutation where
// `input.checkToxicity` is set to true and the comment contains
// toxic language as determined by the perspective service.
class ErrToxic2 extends TalkError {
  constructor() {
    super('The comment appears to contain highly abusive content and will not be published until the moderation team reviews it.', {
      status: 400,
      translation_key: 'STRAIGHT_TO_MODERATION',
    });
  }
}

module.exports = {
  ErrToxic2,
};
