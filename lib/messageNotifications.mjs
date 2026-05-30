const toTime = (value) => {
  if (!value) return 0;
  const date = value.toDate ? value.toDate() : value;
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export function getViewerMessageState(message, viewer = null, options = {}) {
  const isMine = Boolean(
    viewer?.uid && message?.authorId && message.authorId === viewer.uid
  );

  if (isMine || !options.isSampleThread) {
    return { isMine };
  }

  return { isMine: message?.authorRole === "worker" };
}

export function isThreadUnreadForUser(thread, viewer = null) {
  if (!viewer?.uid || !thread?.lastMessageAuthorId) return false;
  if (thread.lastMessageAuthorId === viewer.uid) return false;

  const lastMessageAt = toTime(thread.lastMessageAt || thread.updatedAt);
  if (!lastMessageAt) return false;

  const lastReadAt = toTime(thread.lastReadAtByUser?.[viewer.uid]);
  return lastReadAt < lastMessageAt;
}
