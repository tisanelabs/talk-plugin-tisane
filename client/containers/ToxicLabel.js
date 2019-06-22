import { compose, gql } from 'react-apollo';
import { withFragments, excludeIf } from 'plugin-api/beta/client/hocs';
import {PersonalAttackLabel, HateSpeechLabel, SexualAdvancesLabel, ProfanityLabel, CriminalActivityLabel, 
  ExternalContactLabel, LowRelevanceLabel, SpamLabel, ToxicLabel} from '../components/TisaneLabel';
import { isToxic } from '../utils';

const enhance = compose(
  withFragments({
    // the "fragment" is a declaration
    comment: gql`
      fragment TalkToxicComments_TisaneLabel_Comment on Comment {
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

export default enhance(ToxicLabel);
/*
export default enhance(PersonalAttackLabel);
export default enhance(HateSpeechLabel);
export default enhance(SexualAdvancesLabel);
export default enhance(ProfanityLabel);
export default enhance(CriminalActivityLabel);
export default enhance(ExternalContactLabel);
export default enhance(LowRelevanceLabel);
export default enhance(SpamLabel);
*/