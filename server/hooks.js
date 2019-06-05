const {
  analyseComment,
  isToxic,
  findRelevantFamilies
} = require("./perspective");
const { TALK_TISANE_MINIMUM_SIGNAL2NOISE } = require('./config');
const { ErrToxic } = require("./errors");
const { ImmediateReportError } = require("./errors2");

//const { merge } = require("lodash");
const debug = require("debug")("talk:plugin:toxic-tisane"); //talk:plugin:toxic-comments

function handlePositiveToxic(input) {
  input.status = "SYSTEM_WITHHELD";
  input.actions =
  input.actions && input.actions.length >= 0 ? input.actions : [];
  input.actions.push({
    action_type: "FLAG",
    user_id: null,
    group_id: "TOXIC_COMMENT",
    metadata: {}
  });
}

//not used for now due to conflict on what to do next
function markAsOffTopic(input) {
  input.tags =  input.tags && input.tags.length >= 0 ? input.tags : [];
  //input.tags.push("OFF_TOPIC")
  input.actions.push({
    action_type: "FLAG",
    user_id: null,
    group_id: "OFF_TOPIC",
    metadata: {}
  });
}

async function handleComment(_context, comment, body, isEditing) {
  let relevantFamilies;
  if (!comment.parent_id) {
    const article = await _context.loaders.Assets.getByID.load(comment.asset_id);
    if (article)
      relevantFamilies = await findRelevantFamilies(article.title);
  }
  result = await analyseComment(body, relevantFamilies);
  if (result.report) {
    handlePositiveToxic(comment)
    if (comment.checkToxicity)
      throw new ImmediateReportError();
  }

  if (result.abuse && result.abuse.length > 0) {
    handlePositiveToxic(comment);
    if (comment.checkToxicity)
      throw new ErrToxic();
  }

  if (result.offtopic) {
    markAsOffTopic(comment);
  }
           
  comment.metadata = Object.assign({}, comment.metadata, {
    tisane: result
  });
 
}

// Create all the hooks that will enable Tisane to add scores to Comments.
const hooks = {
  RootMutation: {
    editComment: {
      pre: async (_, { edit: { body }, edit }, _context) => {
        handleComment(_context, edit, body, true);        
      }
    },
    createComment: {
      async pre(_, { input }, _context, _info) {
        handleComment(_context, input, input.body, false);     
      }
    }
  }
};


module.exports = hooks;
