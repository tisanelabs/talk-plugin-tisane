import React from 'react';
import { CommentDetail } from 'plugin-api/beta/client/components';
import { isToxic, isOffTopic } from '../utils';
import styles from './ToxicDetail.css';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { t } from 'plugin-api/beta/client/services';

const getInfo = (toxicity, actions, tags) => {
  const toxic = isToxic(actions);
  const offtopic = isOffTopic (tags)
  let text = t('talk-plugin-toxic-tisane.unlikely');
  if (toxicity == 2) {
    text = t('talk-plugin-toxic-tisane.highly_likely');
  } else if (toxicity == 1) {
    text = t('talk-plugin-toxic-tisane.likely');
  } else if (toxicity == 0) {
    text = t('talk-plugin-toxic-tisane.possibly');
  }

  if (offtopic){
    text = text + "OFF-TOPIC Comment"
  }

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
    info={getInfo(toxicity, actions, tags)}
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
