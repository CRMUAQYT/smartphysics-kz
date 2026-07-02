import DOMPurify from 'isomorphic-dompurify';

/** Sanitizes admin-authored rich text before it is stored / rendered. */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'span',
      'sub', 'sup', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'img',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt', 'title'],
    ALLOW_DATA_ATTR: false,
  });
}
