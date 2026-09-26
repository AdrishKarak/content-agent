/**
 * Backend Security & Sanitization Utilities
 * Protects against prompt injection, formula injection, and payload overflow.
 */

// Known adversarial prompt injection patterns & delimiters
const PROMPT_INJECTION_PATTERNS = [
  /<\|(?:im_start|im_end|system|user|assistant)\|>/gi,
  /\[\/?(?:INST|SYS)\]/gi,
  /<<\/?SYS>>/gi,
  /<\/?system>/gi,
  /<\/?assistant>/gi,
];

/**
 * Sanitizes user input before it is passed to LLM prompts.
 * Strips adversarial delimiters, normalizes Unicode, and clamps string length.
 */
export function sanitizePromptText(input: string, maxLength = 4000): string {
  if (!input || typeof input !== "string") return "";

  // 1. Normalize Unicode (NFC)
  let clean = input.normalize("NFC").trim();

  // 2. Remove known chat/system delimiter tokens
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    clean = clean.replace(pattern, "");
  }

  // 3. Strip NULL bytes and dangerous non-printable control characters (keep newlines & tabs)
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 4. Bound maximum character length
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  return clean;
}

/**
 * Sanitizes CSV data to prevent CSV/Formula Injection attacks (CWE-1236).
 * Prepends a single quote to cells beginning with dangerous characters (=, +, -, @, tab).
 */
export function sanitizeCsvCell(cell: string): string {
  if (!cell || typeof cell !== "string") return "";

  const trimmed = cell.trim();
  const dangerousChars = ["=", "+", "-", "@", "\t", "\r"];

  if (dangerousChars.some((char) => trimmed.startsWith(char))) {
    // Neutralize formula execution in Excel/Sheets
    return `'${cell}`;
  }

  return cell;
}
