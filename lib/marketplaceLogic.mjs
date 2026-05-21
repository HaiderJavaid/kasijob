export const SKILL_TAGS = ["Programming", "Design", "Writing", "Events", "Delivery", "General"];

const SKILL_ALIASES = {
  tech: "Programming",
  "tech/web": "Programming",
  web: "Programming",
  code: "Programming",
  coding: "Programming",
  programming: "Programming",
  design: "Design",
  writing: "Writing",
  translation: "Writing",
  event: "Events",
  events: "Events",
  "event help": "Events",
  delivery: "Delivery",
  general: "General",
};

export function normalizePrimarySkillTag(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "General";

  const exactTag = SKILL_TAGS.find((tag) => tag.toLowerCase() === rawValue.toLowerCase());
  if (exactTag) return exactTag;

  return SKILL_ALIASES[rawValue.toLowerCase()] || "General";
}

export function getSkillLevel(completedCount) {
  const count = Number(completedCount || 0);

  if (count >= 7) return "gold";
  if (count >= 3) return "silver";
  if (count >= 1) return "base";
  return "none";
}

export function canApplyToJob(job, user) {
  if (!job?.id && !job?.posterId) return false;
  if (!user?.uid) return false;
  if (job.posterId && job.posterId === user.uid) return false;

  const status = job.status || "open";
  return status === "review" || status === "open";
}

export function isMessagingUnlockedStatus(status) {
  return status === "shortlisted" || status === "accepted";
}

export function getThreadIdForApplication(applicationId) {
  return `jobapp_${applicationId}`;
}
