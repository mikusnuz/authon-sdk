/**
 * Output-encoding and validation helpers for UI that renders server- or user-supplied
 * values (project branding, profile fields) into HTML/CSS strings.
 */

/** Escape a value for HTML text and quoted attribute contexts (both ' and "). */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Returns the normalized URL when it parses as an absolute http(s) URL, otherwise null. */
export function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2048) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.href;
  } catch {
    return null;
  }
}

const IMAGE_DATA_URL_RE =
  /^data:image\/(?:png|jpeg|gif|webp|svg\+xml)(?:;[a-z0-9-]+=[a-z0-9._-]+)*;base64,[a-z0-9+/]+={0,2}$/i;

/** Max length of an image data URL accepted for rendering (~1.5 MB of base64). */
const MAX_IMAGE_DATA_URL_LENGTH = 2 * 1024 * 1024;

/**
 * Returns the value when it is a base64 data URL of an allowed raster/SVG image type,
 * otherwise null. Callers must only use the result as an <img src> (never inline SVG),
 * which keeps SVG scripts from executing.
 */
export function safeImageDataUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length > MAX_IMAGE_DATA_URL_LENGTH) return null;
  return IMAGE_DATA_URL_RE.test(trimmed) ? trimmed : null;
}

/** Avatar URLs may be absolute http(s) URLs or allowed image data URLs. */
export function safeAvatarUrl(value: unknown): string | null {
  return safeHttpUrl(value) ?? safeImageDataUrl(value);
}

const NUM = String.raw`[+-]?(?:\d{1,3}(?:\.\d+)?|\.\d+)`;
const PCT_OR_NUM = String.raw`${NUM}%?`;
const ALPHA = String.raw`(?:\s*(?:,|\/)\s*${PCT_OR_NUM})?`;
const SEP = String.raw`(?:\s*,\s*|\s+)`;
const COLOR_RES = [
  /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
  new RegExp(String.raw`^rgba?\(\s*${PCT_OR_NUM}${SEP}${PCT_OR_NUM}${SEP}${PCT_OR_NUM}${ALPHA}\s*\)$`, 'i'),
  new RegExp(String.raw`^hsla?\(\s*${NUM}(?:deg)?${SEP}${NUM}%${SEP}${NUM}%${ALPHA}\s*\)$`, 'i'),
];

/** True for hex (#rgb, #rgba, #rrggbb, #rrggbbaa), rgb()/rgba() and hsl()/hsla() colors. */
export function isSafeColor(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const trimmed = value.trim();
  return COLOR_RES.some((re) => re.test(trimmed));
}

/** Returns the color when it passes isSafeColor, otherwise the fallback. */
export function safeColor(value: unknown, fallback: string): string {
  return isSafeColor(value) ? value.trim() : fallback;
}

/** Builds a translucent variant of a validated color (hex via rgba, others via color-mix). */
export function colorWithAlpha(color: string, alpha: number): string {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

/** Border radius in px, clamped to a finite 0-64 range. */
export function safeRadius(value: unknown, fallback = 12): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(64, Math.max(0, n));
}

/** Max length of project custom CSS applied to the modal. */
export const MAX_CUSTOM_CSS_LENGTH = 20000;

/**
 * Neutralizes custom CSS so it can never leave its own <style> element: removes every
 * `</style` (and any `<!--` / `-->` markers) and truncates to MAX_CUSTOM_CSS_LENGTH.
 * The result is still meant to be assigned via textContent, not innerHTML.
 */
export function sanitizeCustomCss(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  let css = value.slice(0, MAX_CUSTOM_CSS_LENGTH);
  let prev: string;
  do {
    prev = css;
    css = css.replace(/<\s*\/\s*style/gi, '').replace(/<!--|-->/g, '');
  } while (css !== prev);
  return css;
}
