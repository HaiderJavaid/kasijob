import test from "node:test";
import assert from "node:assert/strict";

import {
  canApplyToJob,
  getSkillLevel,
  getThreadIdForApplication,
  isMessagingUnlockedStatus,
  normalizePrimarySkillTag,
} from "./marketplaceLogic.mjs";

test("self posters cannot apply to their own job", () => {
  assert.equal(canApplyToJob({ posterId: "poster-1", status: "open" }, { uid: "poster-1" }), false);
  assert.equal(canApplyToJob({ posterId: "poster-1", status: "open" }, { uid: "worker-1" }), true);
});

test("matched and completed jobs cannot receive new applications", () => {
  assert.equal(canApplyToJob({ posterId: "poster-1", status: "matched" }, { uid: "worker-1" }), false);
  assert.equal(canApplyToJob({ posterId: "poster-1", status: "completed" }, { uid: "worker-1" }), false);
});

test("messaging unlocks for shortlisted and accepted applications only", () => {
  assert.equal(isMessagingUnlockedStatus("interested"), false);
  assert.equal(isMessagingUnlockedStatus("shortlisted"), true);
  assert.equal(isMessagingUnlockedStatus("accepted"), true);
  assert.equal(isMessagingUnlockedStatus("rejected"), false);
});

test("skill level thresholds are base, silver, and gold", () => {
  assert.equal(getSkillLevel(0), "none");
  assert.equal(getSkillLevel(1), "base");
  assert.equal(getSkillLevel(3), "silver");
  assert.equal(getSkillLevel(7), "gold");
});

test("primary skill tags normalize to a supported fallback", () => {
  assert.equal(normalizePrimarySkillTag("programming"), "Programming");
  assert.equal(normalizePrimarySkillTag("Event Help"), "Events");
  assert.equal(normalizePrimarySkillTag("unknown"), "General");
});

test("message thread ids are deterministic per application", () => {
  assert.equal(getThreadIdForApplication("abc123"), "jobapp_abc123");
});
