import { compose, gql } from 'react-apollo';
import { withFragments, excludeIf } from 'plugin-api/beta/client/hocs';
import {PersonalAttackLabel, HateSpeechLabel, SexualAdvancesLabel, ProfanityLabel, CriminalActivityLabel, 
  ExternalContactLabel, LowRelevanceLabel} from '../components/TisaneLabel';
import { isToxic } from '../utils';

const enhance = compose(
  withFragments({
    comment: gql`
      fragment TalkToxicComments_ToxicLabel_Comment on Comment {
        actions {
          __typename
          ... on FlagAction {
            reason
          }
        }
      }
    `,
  }),
  excludeIf(({ comment: { actions } }) => !isToxic(actions))
);

export default enhance(PersonalAttackLabel);
export default enhance(HateSpeechLabel);
export default enhance(SexualAdvancesLabel);
export default enhance(ProfanityLabel);
export default enhance(CriminalActivityLabel);
export default enhance(ExternalContactLabel);
export default enhance(LowRelevanceLabel);
