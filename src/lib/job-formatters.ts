const BLOCK_TAGS =
  /<\/?(?:address|article|aside|blockquote|div|dl|dt|dd|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>/gi;

export function stripHtml(value: string | null | undefined): string {
  if (!value?.trim()) return "";

  const spacedMarkup = value
    .replace(/<\s*br\s*\/?>/gi, " ")
    .replace(BLOCK_TAGS, " ");
  const document = new DOMParser().parseFromString(spacedMarkup, "text/html");
  document
    .querySelectorAll("script, style, noscript, template")
    .forEach((element) => element.remove());

  return (document.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function formatEmploymentType(value: string | null | undefined): string {
  if (!value?.trim()) return "";

  const words = value.trim().toLowerCase().replace(/[_-]+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatSource(value: string | null | undefined): string {
  if (!value?.trim()) return "Job source";
  const normalized = value.trim().toLowerCase();
  return normalized === "dice"
    ? "Dice"
    : normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function formatJobAge(
  value: string | null | undefined,
  now = Date.now(),
): string {
  if (!value) return "";

  const postedAt = new Date(value);
  const timestamp = postedAt.getTime();
  if (!Number.isFinite(timestamp)) return "";

  const elapsedMinutes = Math.max(0, Math.floor((now - timestamp) / 60_000));
  if (elapsedMinutes < 60) return `${Math.max(1, elapsedMinutes)}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays}d ago`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(postedAt);
}
