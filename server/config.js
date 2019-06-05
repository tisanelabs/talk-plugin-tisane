const ms = require('ms');

const config = {
  API_ENDPOINT: process.env.TALK_TISANE_API_ENDPOINT || 'https://api.tisane.ai/parse',
  TALK_TISANE_API_KEY: process.env.TALK_TISANE_API_KEY,
  TALK_TISANE_LANGUAGE_CODE: process.env.TALK_TISANE_LANGUAGE_CODE || 'en',
  TALK_TISANE_DO_NOT_STORE: process.env.TALK_TISANE_DO_NOT_STORE || true,
  TALK_TISANE_MIN_BLOCKED_LEVEL: process.env.TALK_TISANE_MIN_BLOCKED_LEVEL || 'medium',
  TALK_TISANE_ALLOW_PROFANITY: process.env.TALK_TISANE_ALLOW_PROFANITY || false,
  TALK_TISANE_ALLOW_SEXUAL_ADVANCES : process.env.TALK_TISANE_ALLOW_SEXUAL_ADVANCES || false,
  TALK_TISANE_DOMAIN_FACTORS  : process.env.TALK_TISANE_DOMAIN_FACTORS || [{}],
  TALK_TISANE_KEYWORD_FEATURES  : process.env.TALK_TISANE_KEYWORD_FEATURES || [{'4':'REG'}],
  TALK_TISANE_STOP_HYPERNYMS  : process.env.TALK_TISANE_STOP_HYPERNYMS || [41239, 108268, 10284, 96652],
  TALK_TISANE_DOMAIN_FACTORS : process.env.TALK_TISANE_DOMAIN_FACTORS || [{"43291": 5.0}], 
  TALK_TISANE_MINIMUM_SIGNAL2NOISE  : process.env.TALK_TISANE_MINIMUM_SIGNAL2NOISE  || 4.0,
  TALK_TISANE_REPORT_IMMEDIATELY: process.env.TALK_TISANE_REPORT_IMMEDIATELY || ['criminal_activity','spam'],
  TALK_TISANE_ALLOWED_ABUSE  : process.env.TALK_TISANE_ALLOWED_ABUSE  || ['profanity','bigotry','personal_attack','sexual_advances'],
  API_TIMEOUT: ms(process.env.TALK_PERSPECTIVE_TIMEOUT || '3000ms')
  
};

if (process.env.NODE_ENV !== 'test' && !config.TALK_TISANE_API_KEY) {
  throw new Error(
    'Please set the TALK_TISANE_API_KEY environment variable to use the Tisane plugin. Visit https://tisane.ai/signup/ to sign up & get your FREE API access.'
  );
}

module.exports = config;
