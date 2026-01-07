// Generates a consistent HSL color string based on a name
export const stringToColor = (str) => {
  if (!str) return "bg-gray-500";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 40%)`; // Darker shade for text contrast
};

// Generates the initials (e.g. "Haider Javaid" -> "HJ")
export const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};