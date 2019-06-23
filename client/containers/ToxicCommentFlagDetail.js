import { compose } from 'react-apollo';
import { excludeIf } from 'plugin-api/beta/client/hocs';
import TisaneToxicDetail from './TisaneDetail';
import { isToxic } from '../utils';

const enhance = compose(
  excludeIf(
    ({ comment: { toxicity, actions } }) =>
      toxicity === null || !isToxic(actions)
  )
);

export default enhance(TisaneToxicDetail);
