/**
 * Extracts the 11-character YouTube video ID from any common URL shape:
 *   youtube.com/watch?v=ID
 *   youtu.be/ID
 *   youtube.com/embed/ID
 *   youtube.com/shorts/ID
 * Returns null if no valid ID is found.
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Bare ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/, // watch?v=
    /youtu\.be\/([a-zA-Z0-9_-]{11})/, // youtu.be/
    /\/embed\/([a-zA-Z0-9_-]{11})/, // /embed/
    /\/shorts\/([a-zA-Z0-9_-]{11})/, // /shorts/
    /\/v\/([a-zA-Z0-9_-]{11})/, // /v/
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(trimmed);
    if (match) return match[1];
  }
  return null;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}`;
}
