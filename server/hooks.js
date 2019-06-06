const {
  analyseComment,
  findRelevantFamilies
} = require("./perspective");

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
  console.log("handlePositiveToxic END");
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
  let result = await analyseComment(body, relevantFamilies);
  if (result.report) {
    if (comment.checkToxicity)
      throw new ImmediateReportError();
    handlePositiveToxic(comment);
  }

  if (result.abuse && result.abuse.length > 0) {
    /*
    if (comment.checkToxicity)
      throw new ErrToxic();
      */
    handlePositiveToxic(comment);
  }

  if (result.offtopic) {
  //  markAsOffTopic(comment);
  }
  
  try {
    if (!isEditing && (result.offtopic || result.abuse && result.abuse.length > 0)) {
      console.log("Assigning metadata");
      comment.metadata = Object.assign({}, comment.metadata, {
        tisane: result
      });
      console.log("Assigning metadata DONE: " + comment.metadata.tisane);
    }
  } catch (err) {
    console.error(err);
  }
 
}

function sendFeedback() {
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
  }
}

// Create all the hooks that will enable Tisane to add metadata to Comments.
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
