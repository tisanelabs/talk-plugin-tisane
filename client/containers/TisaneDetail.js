import { compose, gql } from 'react-apollo';
import { withFragments } from 'plugin-api/beta/client/hocs';
import TisaneToxicDetail from '../components/TisaneDetail';

const enhance = compose(
  withFragments({
    comment: gql`
      fragment TalkToxicComments_ToxicDetail_Comment on Comment {
        toxicity
        actions {
          __typename
          ... on FlagAction {
            reason
          }
        }
      }
    `,
  })
);

export default enhance(TisaneToxicDetail);
