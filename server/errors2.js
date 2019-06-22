const { TalkError } = require('errors');

// ErrToxic is sent during a `CreateComment` mutation where
// `input.checkAbuse` is set to true and the comment contains
// toxic language as determined by the perspective service.
class ImmediateReportError extends TalkError {
  constructor() {
    super('The comment appears to contain highly abusive content and will not be published until the moderation team reviews it.', {
      status: 400,
      translation_key: 'STRAIGHT_TO_MODERATION',
    });
    console.log("Super-abusive");
  }
}

module.exports = {
  ImmediateReportError,
};
