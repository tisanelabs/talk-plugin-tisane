import React from 'react';
import { CommentDetail } from 'plugin-api/beta/client/components';
import { isToxic, isOffTopic } from '../utils';
import styles from './TisaneLabel.css';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { t } from 'plugin-api/beta/client/services';

const buildDescription = (toxicity, actions, tags) => {
  let text = isToxic(actions) ? t('talk-plugin-toxic-tisane.toxic_comment') : '';
  return (
    <div>
      <span className={cn(styles.info, { [styles.toxic]: toxic })}>
      {text}
      </span>
    </div>
  );
};

const ToxicLabel = ({ comment: { actions, toxicity, tags } }) => (
  <CommentDetail
    icon={'error'}
    header={t('talk-plugin-toxic-tisane.toxic_comment')}
    info={buildDescription(toxicity, actions, tags)}
  />
);

ToxicLabel.propTypes = {
  comment: PropTypes.shape({
    actions: PropTypes.array,
    toxicity: PropTypes.toxicity,
    tags: PropTypes.array
  }),
};

export default ToxicLabel;
