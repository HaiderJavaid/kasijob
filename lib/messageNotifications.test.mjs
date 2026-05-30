import test from "node:test";
import assert from "node:assert/strict";

import {
  getViewerMessageState,
  isThreadUnreadForUser,
} from "./messageNotifications.mjs";

test("viewer-owned messages are detected by author id", () => {
  assert.deepEqual(
    getViewerMessageState({ authorId: "poster-1", authorRole: "poster" }, { uid: "poster-1" }),
    { isMine: true }
  );
  assert.deepEqual(
    getViewerMessageState({ authorId: "worker-1", authorRole: "worker" }, { uid: "poster-1" }),
    { isMine: false }
  );
});

test("sample messages keep worker-side fallback when no author id exists", () => {
  assert.deepEqual(
    getViewerMessageState({ authorRole: "worker" }, null, { isSampleThread: true }),
    { isMine: true }
  );
  assert.deepEqual(
    getViewerMessageState({ authorRole: "poster" }, null, { isSampleThread: true }),
    { isMine: false }
  );
});

test("threads are unread only when the latest message is from another participant", () => {
  const lastMessageAt = new Date("2026-05-22T01:00:00.000Z");

  assert.equal(
    isThreadUnreadForUser(
      {
        lastMessageAuthorId: "worker-1",
        lastMessageAt,
        lastReadAtByUser: { "poster-1": new Date("2026-05-22T00:30:00.000Z") },
      },
      { uid: "poster-1" }
    ),
    true
  );
  assert.equal(
    isThreadUnreadForUser(
      {
        lastMessageAuthorId: "poster-1",
        lastMessageAt,
        lastReadAtByUser: { "poster-1": new Date("2026-05-22T00:30:00.000Z") },
      },
      { uid: "poster-1" }
    ),
    false
  );
});

test("missing read markers make other-participant messages unread", () => {
  assert.equal(
    isThreadUnreadForUser(
      {
        lastMessageAuthorId: "worker-1",
        lastMessageAt: new Date("2026-05-22T01:00:00.000Z"),
        lastReadAtByUser: {},
      },
      { uid: "poster-1" }
    ),
    true
  );
});
