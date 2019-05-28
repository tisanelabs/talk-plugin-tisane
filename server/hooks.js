const {
  getScores,
  isToxic,
  getScoresAbtTitle
} = require("./perspective");
const { TALK_TISANE_MINIMUM_SIGNAL2NOISE } = require('./config');
const { ErrToxic } = require("./errors");

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

function MarkAsOffTopic(input) {
  input.tags =  input.tags && input.tags.length >= 0 ? input.tags : [];
  input.tags.push({ 
    tag: {name: 'OFF_TOPIC', created_at: new Date() },
    assigned_by: null,
    created_at: new Date()
  })
}

async function getScore(body, relevant) {
  // Try getting scores.
  let scores;
  try {
    scores = await getScores(body, relevant);
  } catch (err) {
    // Warn and let mutation pass.
    debug("Error sending to API: %o", err);
    return;
  }

  return scores;
}

async function getScoreOfHeadline(body) {
  // Try getting scores.
  let scores;
  try {
    scores = await getScoresAbtTitle(body);
  } catch (err) {
    // Warn and let mutation pass.
    console.log("Request to Headline Analysis Failed: " +err)
    debug("Error sending to API to get headline Relevant array: %o", err);
    return;
  }

  return scores;
}

// Create all the hooks that will enable Tisane to add scores to Comments.
const hooks = {
  RootMutation: {
    editComment: {
      pre: async (_, { edit: { body }, edit }, _context) => {
        //Analyse the Headline before going to the comment
       const asset = await _context.loaders.Assets.getByID.load(edit.asset_id);
        if (asset) {
          const headlinerelevant = await getScoreOfHeadline(asset.title);
          console.log('headline: '+JSON.stringify(headlinerelevant))
          if (headlinerelevant.TOPIC.relevant !== null) {
            const scores = await getScore(
              body,
              headlinerelevant.TOPIC.relevant
            );

            if (scores.TOXICITY.SignaltoNoise && (scores.TOXICITY.SignaltoNoise < TALK_TISANE_MINIMUM_SIGNAL2NOISE)){
              MarkAsOffTopic(edit)
            }
            ////INSERT HERE IN CASE
             if (isToxic(scores)) {
                handlePositiveToxic(edit);
             }
          }
        } else {
          debug("Asset of Context not found onEdit: %o", edit.asset_id);
        }
      }
    },
    createComment: {
      async pre(_, { input }, _context, _info) {
        //Analyse the Headline before going to the comment
        const asset = await _context.loaders.Assets.getByID.load(
          input.asset_id
        );
        debug("Asset is here found: %o", JSON.stringify(asset));
        console.log(JSON.stringify(asset))
        if (asset !== null && asset !== undefined) {
          const headlinerelevant = await getScoreOfHeadline(asset.title);
          if (headlinerelevant.TOPIC.relevant !== null ) {
            //Then go ahead and analyse the Comment
            const scores = await getScore(
              input.body,
              headlinerelevant.TOPIC.relevant
            );

            if (scores.TOXICITY.SignaltoNoise && (scores.TOXICITY.SignaltoNoise < TALK_TISANE_MINIMUM_SIGNAL2NOISE)){
              MarkAsOffTopic(input)
            }

            if (isToxic(scores)) {
              if (input.checkToxicity) {
                throw new ErrToxic();
              }

              // Mark the comment as positive toxic.
              handlePositiveToxic(input);
            }

            // Attach level to metadata also.
            input.metadata = Object.assign({}, input.metadata, {
              perspective: scores
            });
          }
        } else {
          debug("Asset of Context not found: %o", input.asset_id);
        }
      }
    }
  }
};

/**
// If feedback sending is enabled, we need to add in the hooks for processing
// feedback.
if (SEND_FEEDBACK) {
  // statusMap provides a map of Talk names to ones Perspective are expecting.
  const statusMap = {
    ACCEPTED: 'APPROVED',
    REJECTED: 'DELETED',
  };

  // Merge these hooks into the hooks for plugging into the graph operations.
  merge(hooks, {
    RootMutation: {
      // Hook into mutations associated with accepting/rejecting comments.
      setCommentStatus: {
        async post(root, args, ctx) {
          if (ctx.user && args.status in statusMap) {
            const comment = await ctx.loaders.Comments.get.load(args.id);
            if (comment) {
              const asset = await ctx.loaders.Assets.getByID.load(comment.asset_id);

              // Submit feedback.
              submitFeedback(comment, asset, statusMap[args.status]);
            }
          }
        },
      },
      // Hook into mutations associated with featuring comments.
      addTag: {
        async post(root, args, ctx) {
          if (
            ctx.user &&
            args.tag.name === 'FEATURED' &&
            args.tag.item_type === 'COMMENTS'
          ) {
            const comment = await ctx.loaders.Comments.get.load(args.tag.id);
            if (comment) {
              const asset = await ctx.loaders.Assets.getByID.load(
                comment.asset_id
              );

              // Submit feedback.
              submitFeedback(comment, asset, 'HIGHLIGHTED');
            }
          }
        },
      },
    },
  });
}**/

module.exports = hooks;
