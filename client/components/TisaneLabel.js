import React from 'react';
import { FlagLabel } from 'plugin-api/beta/client/components/ui';

const PersonalAttackLabel = () => <FlagLabel iconName="error">Personal Attack</FlagLabel>;
const HateSpeechLabel = () => <FlagLabel iconName="error">Hate Speech</FlagLabel>;
const SexualAdvancesLabel = () => <FlagLabel iconName="error">Sexual Advances</FlagLabel>;
const ProfanityLabel = () => <FlagLabel iconName="error">Profanity</FlagLabel>;
const CriminalActivityLabel = () => <FlagLabel iconName="error">Criminal Activity</FlagLabel>;
const ExternalContactLabel = () => <FlagLabel iconName="error">External Contact</FlagLabel>;
const LowRelevanceLabel = () => <FlagLabel iconName="error">Low Relevance</FlagLabel>;

export default PersonalAttackLabel;
export default HateSpeechLabel;
export default SexualAdvancesLabel;
export default ProfanityLabel;
export default CriminalActivityLabel;
export default ExternalContactLabel;
export default LowRelevanceLabel;