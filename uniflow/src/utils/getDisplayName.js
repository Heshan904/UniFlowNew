const STORAGE_KEY = "userFullName";

export function getDisplayName() {
  const fullName = (localStorage.getItem(STORAGE_KEY) || "").trim();
  if (!fullName) return "USER";
  const parts = fullName.split(" ").filter(Boolean);
  const segment = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  return segment.toUpperCase();
}

export default getDisplayName;
