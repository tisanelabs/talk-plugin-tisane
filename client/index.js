import translations from './translations.yml';
import TisaneHook from './containers/TisaneHook';
import TisaneLabel from './containers/TisaneLabel';
import ToxicCommentDetail from './containers/ToxicCommentDetail';
import ToxicCommentFlagDetail from './containers/ToxicCommentFlagDetail';

export default {
  translations,
  slots: {
    commentInputDetailArea: [TisaneHook],
    adminCommentLabels: [TisaneLabel],
    adminCommentMoreDetails: [ToxicCommentDetail],
    adminCommentMoreFlagDetails: [ToxicCommentFlagDetail],
  },
};
