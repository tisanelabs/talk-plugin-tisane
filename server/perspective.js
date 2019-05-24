const fetch = require('node-fetch');
const {
  API_ENDPOINT,
  TALK_TISANE_API_KEY,
  TALK_TISANE_LANGUAGE_CODE,
  API_TIMEOUT,
  TALK_TISANE_DO_NOT_STORE,
  TALK_TISANE_MIN_BLOCKED_LEVEL,
  TALK_TISANE_ALLOW_PROFANITY,
  TALK_TISANE_ALLOW_SEXUAL_ADVANCES,
  TALK_TISANE_DOMAIN_FACTORS,
  TALK_TISANE_KEYWORD_FEATURES,
  TALK_TISANE_STOP_HYPERNYMS,
  TALK_TISANE_MINIMUM_SIGNAL2NOISE,
  TALK_TISANE_ALLOWED_ABUSE,
  TALK_TISANE_BANNED_ABUSE
} = require('./config');

const debug = require('debug')('talk:plugin:toxic-tisane');
const get = require('lodash/get');


async function send(body) {
  // Perform the fetch.
  const res = await fetch(`${API_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': TALK_TISANE_API_KEY
    },
    timeout: API_TIMEOUT,
    body: JSON.stringify(body, null, 2),
  });

  if (!res.ok) {
    return null;
  }

  // Grab the JSON from the request.
  const data = await res.json();

  // Send the data back!
  return data;
}

/**
 * Get response from the Tisane api
 *
 * @param  {string}  text  text to be analyzed
 * @return {object}        object containing analysis of text using 
 */
async function getScores(text, relevant) {
  debug('Sending to Tisane: %o', text);
  let severity = 0 //Normal level
  // Send the comment off to be analyzed.
  const data = await send({
    content: text,
    // TODO: support other languages.
    language: TALK_TISANE_LANGUAGE_CODE,
    settings: {
      "parses": false,
      "sentiment":false, 
      "words":false, 
      "deterministic":true, 
      "format":"dialogue",
      "relevant": relevant
    }
  });

  if (!data || data.error) {
    debug('Received Error when submitting: %o', data.error);
    return {
      TOXICITY: {
        AbuseList: null,
        SignaltoNoise: null
      }
    };
  }

  var allowed = findAllowedToxic(data.abuse)

  var banned = findBannedToxic(data.abuse)

  if (banned.length > 0){
    severity = 2
  }
  else if (allowed.length > 0 ){
    severity = 1
  }
  else {
    severity = 0
  }

  return {
    TOXICITY: {
      AbuseLevel: severity,
      SignaltoNoise: data.signal2noise
    }
  };
}

/**
 * Get response from the Tisane api about the Headline
 *
 * @param  {string}  title  text to be analyzed
 * @return {object}        object containing analysis of text using 
 */
async function getScoresAbtTitle(title) {
  debug('Sending Headline to Tisane: %o', title);
  let severity = 0 //Normal level
  // Send the comment off to be analyzed.
  const data = await send({
    content: text,
    // TODO: support other languages.
    language: TALK_TISANE_LANGUAGE_CODE,
    settings: {
      "parses": false,
      "sentiment":false, 
      "words":false, 
      "deterministic":true, 
      "format":"dialogue",
      "keyword_features": TALK_TISANE_KEYWORD_FEATURES, 
      "stop_hypernyms": TALK_TISANE_STOP_HYPERNYMS
    }
  });

  if (!data || data.error) {
    debug('Received Error when submitting: %o', data.error);
    return {
      TOPIC: {
        relevant: null
      }
    };
  }

  
  return {
    TOPIC: {
      relevant: data.relevant
    }
  };
}


/**
 * findAllowedToxic determines if given text context is toxic and LOads only Allowed Types 
 *
 * @param  {array}  AbuseList of Toxicity array
 * 
 * @return {boolean}
 */
function findAllowedToxic(toxicarray) {
  //empty abuse set
  let abusetemp = []

  //Find toxic allowed
  TALK_TISANE_ALLOWED_ABUSE.forEach(function (item, index) {
    for (let ab in toxicarray) {
      if (ab.type === item){
        abusetemp.push(ab)
        }
    }
  })
  return abusetemp
}

/**
 * findBannedToxic determines if given text context is toxic and LOads only Allowed Types 
 *
 * @param  {array}  AbuseList of Toxicity array
 * 
 * @return {boolean}
 */
function findBannedToxic(toxicarray) {
  //empty abuse set
  let abusetemp = []

  //Find toxic banned
  TALK_TISANE_BANNED_ABUSE.forEach(function (item, index) {
    for (let ab in toxicarray) {
      if (ab.type === item){
        abusetemp.push(ab)
        }
    }
  })
  return abusetemp
}

/**
 * isToxic determines if given severity score is Toxic
 * threshold.
 *
 * @param  {number} severity score
 * @return {boolean}
 */
function isToxic(level) {

  var severity = level.TOXICITY.AbuseLevel
  return severity > 0
}

/**
 * wrapError will mask API key in error messages.
 *
 * @param {Error} err the error potentially containing the API key
 */
function wrapError(err) {
  if (err.message) {
    err.message = err.message.replace(TALK_TISANE_API_KEY, '***');
  }

  return err;
}

/**
 * maskKeyInError is a decorator that calls fn and masks the
 * TALK_TISANE_API_KEY in errors before throwing.
 *
 * @param  {function} fn Function that returns a Promise
 * @return {function} decorated function
 */
function maskKeyInError(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      throw wrapError(err);
    }
  };
}



module.exports = {
  getScores: maskKeyInError(getScores),
  isToxic,
  getScoresAbtTitle: maskKeyInError(getScoresAbtTitle)
};
