// Small shared formatting helpers (no external date library).

export const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// "Free" stays as is, amounts are shown untouched (backend stores strings).
export const formatEntryFee = (entryFee) => entryFee?.trim() || "Not specified";

export const formatBestTime = (bestTimeToVisit) =>
  bestTimeToVisit?.trim() || "All year round";
