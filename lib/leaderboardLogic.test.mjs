import test from "node:test";
import assert from "node:assert/strict";

import { buildLeaderboard } from "./leaderboardLogic.mjs";

test("leaderboard includes users with emailVerified false", () => {
  const leaders = buildLeaderboard([
    { id: "verified", balance: 1, emailVerified: true },
    { id: "unverified", balance: 2, emailVerified: false },
  ]);

  assert.deepEqual(leaders.map((user) => user.id), ["unverified", "verified"]);
});

test("leaderboard defaults missing balances to zero and caps to top ten", () => {
  const users = Array.from({ length: 12 }, (_, index) => ({
    id: `user-${index}`,
    balance: index === 0 ? undefined : index,
  }));

  const leaders = buildLeaderboard(users);

  assert.equal(leaders.length, 10);
  assert.equal(leaders[0].id, "user-11");
  assert.equal(leaders.at(-1).balance, 2);
});
