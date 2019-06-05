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

async function getScore(body, relevant) {
  // Try getting scores.
  let scores;
  try {
    scores = await analyseComment(body, relevant);
  } catch (err) {
    // Warn and let mutation pass.
    debug("Error sending to API: %o", err);
    return;
  }

  return scores;
}

function handleComment(comment, body, isEditing) {
  let relevantFamilies;
  if (!comment.parent_id) {
    const article = await _context.loaders.Assets.getByID.load(comment.asset_id);
    if (article)
      relevantFamilies = await findRelevantFamilies(asset.title);
  }
  result = await analyseComment(body, relevantFamilies);
  if (result.report) {
    handlePositiveToxic(comment)
    throw new ImmediateReportError();
  }

  if (result.abuse && result.abuse.length > 0) {
    handlePositiveToxic(input);
    throw new ErrToxic();
  }

  if (result.offtopic) {
    markAsOffTopic(comment);
  }
           
  input.metadata = Object.assign({}, input.metadata, {
    tisane: result
  });
 
}

// Create all the hooks that will enable Tisane to add scores to Comments.
const hooks = {
  RootMutation: {
    editComment: {
      pre: async (_, { edit: { body }, edit }, _context) => {
        handleComment(edit, body, true);        
      }
    },
    createComment: {
      async pre(_, { input }, _context, _info) {
        handleComment(input, body, false);     
      }
    }
  }
};


module.exports = hooks;
