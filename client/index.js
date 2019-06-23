import translations from './translations.yml';
import TisaneHook from './containers/TisaneHook';
import TisaneToxicLabel from './containers/TisaneLabel';
import ToxicCommentDetail from './containers/ToxicCommentDetail';
import ToxicCommentFlagDetail from './containers/ToxicCommentFlagDetail';

export default {
  translations,
  slots: {
    commentInputDetailArea: [TisaneHook],
    adminCommentLabels: [TisaneToxicLabel],
    adminCommentMoreDetails: [ToxicCommentDetail],
    adminCommentMoreFlagDetails: [ToxicCommentFlagDetail],
  },
};
