const fetch = require("node-fetch");
const {
  API_ENDPOINT,
  TALK_TISANE_API_KEY,
  TALK_TISANE_LANGUAGE_CODE,
  API_TIMEOUT,
  TALK_TISANE_DO_NOT_STORE,
  TALK_TISANE_DOMAIN_FACTORS,
  TALK_TISANE_MIN_BLOCKED_LEVEL,
  TALK_TISANE_ALLOW_PROFANITY,
  TALK_TISANE_ALLOW_SEXUAL_ADVANCES,
  TALK_TISANE_KEYWORD_FEATURES,
  TALK_TISANE_STOP_HYPERNYMS,
  TALK_TISANE_MINIMUM_SIGNAL2NOISE,
  TALK_TISANE_REPORT_IMMEDIATELY
} = require("./config");

const debug = require("debug")("talk:plugin:toxic-tisane");

async function send(body) {
  // Perform the fetch.
  const res = await fetch(`${API_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": TALK_TISANE_API_KEY
    },
    timeout: API_TIMEOUT,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    return null;
  }

  // Grab the JSON from the request.
  const data = await res.json();

  // Send the data back!
  return data;
}

function severityGradeToNumber(severity) {
  switch (severity) {
    case "medium" : return 1;
    case "high" : return 2;
    case "extreme" : return 3;
    case "default": return 3;
    default : return 0;
  }
}

/**
 * Get response from the Tisane API
 *
 * @param  {string}  text  text to be analyzed
 * @return {object}        object containing analysis of text using
 */
async function analyseComment(text, relevant) {
  debug("Sending to Tisane: %o", text);

  // Send the comment off to be analyzed.
  let data = null;
  data = await send({
    content: text,
    language: TALK_TISANE_LANGUAGE_CODE,
    settings: {
      "parses": false,
      "sentiment": false,
      "words": false,
      "deterministic": true,
      "format": "dialogue",
      "domain_factors": normalizeDomainFactors(),
      "relevant": relevant ? relevant : null
    }
  });

  if (!data || data.error) {
    debug("Error when submitting: %o", data.error);
    console.log("Get Score for Text Error: " + data.error);
    return {
      abuse: null,
      signal2noise: null
    };
  }

  console.log("Tisane response: " + JSON.stringify(data));
  console.log("Sexual advances allowed: " + TALK_TISANE_ALLOW_SEXUAL_ADVANCES);
  console.log("Profanity allowed: " + TALK_TISANE_ALLOW_PROFANITY);

  const minBlockedAbuseSeverityLevel = severityGradeToNumber(TALK_TISANE_MIN_BLOCKED_LEVEL);
  let filteredAbuseInstances = [];
  let reportImmediately = false;
  if (data.abuse) {
    for (let abIn of data.abuse) {
      let abuseType = abIn.type;
      if (TALK_TISANE_ALLOW_PROFANITY && abuseType.type === 'profanity'
          || TALK_TISANE_ALLOW_SEXUAL_ADVANCES && abuseType.type === 'sexual_advances')
        continue;
      if (TALK_TISANE_REPORT_IMMEDIATELY && TALK_TISANE_REPORT_IMMEDIATELY.indexOf(abIn.type) > -1) {
        reportImmediately = true;
      } else {
        let level = severityGradeToNumber(abIn.severity);
        if (level < minBlockedAbuseSeverityLevel) continue;
      }
      filteredAbuseInstances.push(abIn);
    }
  }
  //
  return {
    abuse: filteredAbuseInstances,
    report: reportImmediately,
    signal2noise: data.signal2noise,
    offtopic: data.signal2noise < TALK_TISANE_MINIMUM_SIGNAL2NOISE
  };
}

function normalizeDomainFactors() {
  return TALK_TISANE_DOMAIN_FACTORS ? TALK_TISANE_DOMAIN_FACTORS[0]: {};
}

/**
 * Get response from the Tisane API about the Headline
 *
 * @param  {string}  title  text to be analyzed
 * @return {object}        object containing analysis of text using
 */
async function findRelevantFamilies(title) {
  debug("Sending Headline to Tisane: %o", title);
  // Send the title to be analyzed.
  const data = await send({
    content: title,
    language: TALK_TISANE_LANGUAGE_CODE,
    settings: {
      "parses": false,
      "sentiment": false,
      "words": false,
      "deterministic": true,
      "format": "dialogue",
      "domain_factors": normalizeDomainFactors(),
      "keyword_features": TALK_TISANE_KEYWORD_FEATURES[0],
      "stop_hypernyms": TALK_TISANE_STOP_HYPERNYMS
    }
  });

  if (!data || data.error) {
    debug("Received Error when submitting: %o", data.error);
    console.log("Get Headline Error: " + data.error);
    return {
      TOPIC: {
        relevant: null
      }
    };
  }

  console.log("Get Headline Success: " + JSON.stringify(data));

  return data.relevant;
}


/**
 * wrapError will mask API key in error messages.
 *
 * @param {Error} err the error potentially containing the API key
 */
function wrapError(err) {
  if (err.message) {
    err.message = err.message.replace(TALK_TISANE_API_KEY, "***");
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
  analyseComment: maskKeyInError(analyseComment),
  findRelevantFamilies: maskKeyInError(findRelevantFamilies)
};
