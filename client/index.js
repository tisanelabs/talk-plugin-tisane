import translations from './translations.yml';
import TisaneHook from './containers/TisaneHook';
import ToxicLabel from './containers/ToxicLabel';
import ToxicCommentDetail from './containers/ToxicCommentDetail';
import ToxicCommentFlagDetail from './containers/ToxicCommentFlagDetail';

export default {
  translations,
  slots: {
    commentInputDetailArea: [TisaneHook],
    adminCommentLabels: [ToxicLabel],
    adminCommentMoreDetails: [ToxicCommentDetail],
    adminCommentMoreFlagDetails: [ToxicCommentFlagDetail],
  },
};
