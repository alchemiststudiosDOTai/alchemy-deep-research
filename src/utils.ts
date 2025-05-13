// Utility functions

/**
 * Sanitizes a query string for use as a filename.
 * Replaces spaces with underscores, removes most non-alphanumeric characters,
 * converts to lowercase, and truncates.
 * @param query The query string.
 * @returns A sanitized string suitable for a filename.
 */
export function sanitizeQueryForFilename(query: string): string {
  if (!query) return "untitled_query";
  return query
    .toLowerCase()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^\w.-]/g, "") // Remove non-alphanumeric characters except underscore, dot, hyphen
    .slice(0, 100); // Truncate to 100 chars
}