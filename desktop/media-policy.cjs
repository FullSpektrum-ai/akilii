function audioRequestAllowed({
  sameWindow,
  permission,
  url,
  origin,
  isMainFrame,
  mediaTypes,
}) {
  try {
    return (
      sameWindow &&
      permission === 'media' &&
      isMainFrame === true &&
      new URL(url).origin === origin &&
      Array.isArray(mediaTypes) &&
      mediaTypes.length === 1 &&
      mediaTypes[0] === 'audio'
    );
  } catch {
    return false;
  }
}
module.exports = { audioRequestAllowed };
