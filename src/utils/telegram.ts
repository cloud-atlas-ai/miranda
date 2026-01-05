/**
 * Escape Markdown special characters for Telegram's MarkdownV1 parse mode.
 * Characters: _ * ` [ ] ( ) \
 * Handles stack traces and arbitrary error messages safely.
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([_*`\[\]()\\])/g, "\\$1");
}
