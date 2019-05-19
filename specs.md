# Tisane API Coral Project Talk Plug-in Specs

## Introduction

[Tisane API](https://tisane.ai) is a RESTful service to parse text in multiple languages. The developer portal for Tisane API is at https://dev.tisane.ai. 
Coral Project’s Talk (https://coralproject.net/talk/) is an open-source commenting platform. Talk runs on React. The source code for Talk is at https://github.com/coralproject/talk. 
Talk allows plug-ins. We want to build a plug-in that uses Tisane API to help moderators handle abusive comments. The Tisane plug-in will not be the first moderation aid plug-in. There is already a plug-in for so-called Perspective API (https://docs.coralproject.net/talk/plugin/talk-plugin-toxic-comments, https://docs.coralproject.net/talk/toxic-comments/), which can and should be used as a base. 
