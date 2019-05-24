export function isToxic(actions) {
  return actions.some(
    action =>
      action.__typename === 'FlagAction' && action.reason === 'TOXIC_COMMENT'
  );
}

export function isOffTopic(tags) {
  return tags.some(
    tagobj =>
      tagobj.tag.name === 'OFF_TOPIC'
  );
}
