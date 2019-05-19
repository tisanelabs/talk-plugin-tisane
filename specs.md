# Tisane API Coral Project Talk Plug-in Specs

## Introduction

[Tisane API](https://tisane.ai) is a RESTful service to parse text in multiple languages. The developer portal for Tisane API is at https://dev.tisane.ai. 
[Coral Project's Talk](https://coralproject.net/talk/) is an open-source commenting platform. Talk runs on React. The source code for Talk is at https://github.com/coralproject/talk. 
Talk allows plug-ins. We want to build a plug-in that uses Tisane API to help moderators handle abusive comments. The Tisane plug-in will not be the first moderation aid plug-in. There is already a [plug-in for so-called Perspective API](https://docs.coralproject.net/talk/plugin/talk-plugin-toxic-comments), which can be used as a base for this plug-in. 

## Functionality to Implement

Similarly to the [Talk Toxic Comments plug-in](https://docs.coralproject.net/talk/toxic-comments/), but with slightly different conditions: 

* The plug-in sends every incoming comment to the Tisane service for analysis
* If a comment contains an abuse snippet of the type: `bigotry`, `personal_attack`, `sexual_advances`, `profanity`, and the abuse type is enabled via the plug-in configuration (see the _Plug-in Configuration Settings_ chapter below), the commenter is warned that their comment may violate the community rules. The commenter is given the chance to modify their comment before posting. If a comment contains an abuse snippet of the type `criminal_activity` or `spam`, it is sent to the Reported queue for moderation, and is not displayed in the stream. 
* If the analysis of the revised comment does not contain any abuse, the comment is posted and displayed normally. 
* If there is still some kind of abuse, the comment is not displayed in the stream and instead is sent to the Reported queue for moderation.
* If the moderator accepts the comment, it’s displayed on the stream. If it is rejected, it will not be displayed. 
* Moderators see the type of the offence and the offending text fragment. 

In addition: based on the Tisane signal to noise ranking, off-topic and low-quality comments are added a special tag indicating they are off-topic (the tag is `OFF_TOPIC`). 

### Main Differences from Perspective API Plug-in

*	Tisane API does not tag “level of toxicity”. It tags the offending text fragment and classifies the type of offence. Therefore, we must classify it. 
* Tisane API has a `severity` attribute. The administrators will be able to choose the severity levels to ignore and take into considerations (Perspective plug-in instead has a Toxicity Threshold with 0.8 being the default value). 
* Signal to noise ranking does not exist in Perspective API. The headline of the article must be sent to Tisane API prior to analysing the comments as described under the Tisane API calls section.

## Deliverables

*	Source code for the plug-in stored in GitHub under https://github.com/tisanelabs/talk-plugin-tisane.
* Running instance of the Talk server with the plug-in installed. A Linux machine instance in the cloud will be provided by Tisane Labs after a consultation with the developers.

## Plug-in Configuration Settings

*	`TALK_TISANE_API_KEY` (required) – the API key for Tisane. An API key can be obtained at https://tisane.ai/signup/. 
*	`TALK_TISANE_LANGUAGE_CODE` (required) – the language code to send to Tisane API. The default is `en`.
*	`TALK_TISANE_DO_NOT_STORE` - whether the API stores or deletes the comment text and context from this request after it has been evaluated. Stored comments will be used for future research and community model building purposes to improve the API over time (default: `true`). 
*	`TALK_TISANE_MIN_BLOCKED_LEVEL` – the minimum level of abuse being acted upon. Default: `medium` (all abuse is blocked except `low`). 
*	`TALK_TISANE_ALLOW_PROFANITY` – if true, then profanity will not be considered abuse (default: `false`).
*	`TALK_TISANE_ALLOW_SEXUAL_ADVANCES` – if true, then sexual advances will not be considered abuse (default: `false`)
*	`TALK_TISANE_DOMAIN_FACTORS` – used to customise disambiguation, e.g. prioritise a particular location when ambiguous (default: not set). 
*	`TALK_TISANE_KEYWORD_FEATURES` – used to find concepts relevant to the signal to noise ranking (default: `["4":"REG"]`). Only used when analysing the headline.
*	`TALK_TISANE_STOP_HYPERNYMS` – used to mark particular concepts as stop-words based on their hypernyms or “supertypes” (default: `[41239, 108268, 10284, 96652]`). Only used when analysing the headline.
*	`TALK_TISANE_MINIMUM_SIGNAL2NOISE` – the minimum signal to noise ranking for a comment not to be tagged as off-topic (default: `0.5`). *Only if* the value of the `signal2noise` attribute in the response exists and is lower than the setting, the comment is to be tagged as `OFF_TOPIC`.

# Tisane API Calls

There is only one web method to call: POST https://api.tisane.ai/parse. The method has a JSON body with three attributes:

*	`language` – the language code (normally ISO 639-2 / IETF) of the content. Taken from the `TALK_TISANE_LANGUAGE_CODE` configuration parameter. 
*	`content` – the text to be analysed. 
*	`settings` – a JSON set of settings to be sent. 

In order to authenticate, add your Tisane API key as a `Ocp-Apim-Subscription-Key` header with your call as [directed in the Tisane API Knowledge Base](http://tisane.ai/knowledgebase/how-do-i-get-the-api-key/). In order to measure the signal to noise ranking (that is, see whether the comment is offtopic), we first need to obtain the relevant topics and concepts. This is accomplished by analysing the article’s title / headline. The response provides an array of integers used in the settings string when analysing comments.

Generally, the settings string is set to `{"parses":false, "sentiment":false, "words":false, "deterministic":true, "format":"dialogue", "domain_factors": $TALK_TISANE_DOMAIN_FACTORS, $DEPENDS_ON_SITUATION}` where:

* `$TALK_TISANE_DOMAIN_FACTORS` is the value of the `TALK_TISANE_DOMAIN_FACTORS` configuration setting
* `$DEPENDS_ON_SITUATION` depends on the situation, as described below

# Settings

## Article Title
When analysing the article title to get the list of relevant concepts and topics, the `$CUSTOM` portion of the settings is:

`"keyword_features": $TALK_TISANE_KEYWORD_FEATURES, "stop_hypernyms": $TALK_TISANE_STOP_HYPERNYMS`

Where
*	`$TALK_TISANE_KEYWORD_FEATURES` is the value of the `TALK_TISANE_KEYWORD_FEATURES` configuration setting
*	`$TALK_TISANE_STOP_HYPERNYMS` is the value of the `TALK_TISANE_STOP_HYPERNYMS` configuration setting
The response will contain an attribute containing an array of integers to be used when analysing comments. The name of the attribute is relevant. (For example, `"relevant": [12345,67890,23469]`.)

## Root Comments
When analysing comments which are not responses to another comment, the `$DEPENDS_ON_SITUATION` portion of the settings is the relevant attribute returned by the article title analysis. For example, `"relevant": [12345,67890,23469]`.

## Response Comments
When analysing comments which respond to other comments, the `$DEPENDS_ON_SITUATION` portion of the settings is empty. Note that the comma before it must be removed, otherwise, the JSON is not valid. 
