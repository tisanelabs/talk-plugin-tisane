import React from 'react';
import PropTypes from 'prop-types';
import { t } from 'plugin-api/beta/client/services';

/**
 * TisaneHook adds hooks to the `commentBox`
 * that handles checking a comment for toxicity.
 */
export default class TisaneHook extends React.Component {
  // checked signifies if we already sent a request with the `checkAbuse` set to true.
  checked = false;

  componentDidMount() {
    this.toxicityPreHook = this.props.registerHook('preSubmit', input => {
      // If we haven't check the toxicity yet, make sure to include `checkAbuse=true` in the mutation.
      // Otherwise post comment without checking the toxicity.
      console.log('Pre submit');
      if (!this.checked) {
        this.checked = true;
        return {
          ...input,
          checkAbuse: true,
        };
      }
    });

    this.toxicityPostHook = this.props.registerHook('postSubmit', result => {
      console.log('Post submit');
      const actions = result.createComment.actions;
      if (
        actions &&
        actions.some(
          ({ __typename, reason }) =>
            __typename === 'FlagAction' && reason === 'TOXIC_COMMENT'
        )
      ) {
        const comment = result.createComment.comment;
        console.log(Object.keys(comment));
        if (comment.metadata && comment.metadata.report) {
          this.props.notify('error', t('talk-plugin-toxic-tisane.straight_to_moderation'));
        } else {
          this.props.notify('error', t('talk-plugin-toxic-tisane.still_toxic'));
        }
      }

      // Reset `checked` after comment was successfully posted.
      this.checked = false;
    });
  }

  componentWillUnmount() {
    this.props.unregisterHook(this.toxicityPreHook);
    this.props.unregisterHook(this.toxicityPostHook);
  }

  render() {
    return null;
  }
}

TisaneHook.propTypes = {
  notify: PropTypes.func.isRequired,
  registerHook: PropTypes.func,
  unregisterHook: PropTypes.func,
};
