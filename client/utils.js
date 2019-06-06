export function isToxic(actions) {
  return actions.some(
    action =>
      action.__typename === 'FlagAction' && action.reason === 'TOXIC_COMMENT'
  );
}

export function isOffTopic(actions) {
  return actions.some(
    action =>
      action.__typename === 'FlagAction' && action.reason === 'OFF_TOPIC'
  );
}
