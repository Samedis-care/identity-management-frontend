import DOMPurify from "dompurify";

// Note: the reverse-tabnabbing DOMPurify hook (afterSanitizeAttributes) is
// registered once at the app entry point (src/index.tsx), not here — this
// module is intentionally side-effect-free (see package.json "sideEffects")
// so it stays tree-shakeable and testable in isolation.

/**
 * Sanitize an HTML string before it is injected via dangerouslySetInnerHTML.
 *
 * Defense-in-depth: the markdown sources we render (app-info, policy,
 * acceptance, maintenance text) are all admin-authored, but sanitizing here
 * strips scripts, inline event handlers and javascript:/data: URLs regardless
 * of the source's trust level. Wired into the global marked postprocess hook
 * (see src/index.tsx) so every marked() call site is covered automatically.
 */
export const sanitizeHtml = (html: string): string => DOMPurify.sanitize(html);

/**
 * Sanitize an SVG string before it is injected via dangerouslySetInnerHTML
 * (e.g. a backend-generated TOTP QR code). Keeps SVG shape elements while
 * removing scripts and event handlers.
 */
export const sanitizeSvg = (svg: string): string =>
  DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });
