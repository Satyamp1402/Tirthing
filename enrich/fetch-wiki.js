// ============================================================================
// fetch-wiki.js — Fetches descriptions and thumbnail images from Wikipedia
// ============================================================================
//
// The Wikipedia API (MediaWiki Action API) provides structured access to
// article content without scraping HTML. We use two properties:
//   - extracts:   plain-text summary (first 3 sentences of the article intro)
//   - pageimages: thumbnail image associated with the article
//
// This gives us both a human-readable description and a real photo for each
// pilgrimage site — much better than placeholder images.
//
// Rate limiting: Wikipedia asks for no more than 200 requests/second for
// unauthenticated use. Our 300ms delay between calls (~3 req/s) is very
// conservative and respectful.
// ============================================================================


// ─── CONSTANTS ───────────────────────────────────────────────────────────────

// Wikipedia API endpoint — the English Wikipedia's Action API
const WIKI_API_BASE = 'https://en.wikipedia.org/w/api.php';

// Thumbnail width in pixels — 400px is enough for card-style UI display
// without downloading unnecessarily large images
const THUMBNAIL_WIDTH = 400;

// Delay between consecutive API calls in milliseconds.
// 1200ms = ~1 request/second. Wikipedia's API rate-limits unauthenticated
// clients aggressively — 300ms triggered 429 errors for large city datasets.
const RATE_LIMIT_DELAY_MS = 1200;


// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

/**
 * Fetches a summary description and thumbnail image for a pilgrimage site
 * from the English Wikipedia.
 *
 * The function queries the MediaWiki Action API with two property modules:
 *   - `extracts`: Retrieves the introductory paragraph as plain text
 *   - `pageimages`: Retrieves the primary image associated with the article
 *
 * Wikipedia's title matching is fuzzy — "Kashi Vishwanath Temple" will match
 * the article at "Kashi_Vishwanath_Temple" automatically.
 *
 * @param {string} siteName - Name of the site to look up (e.g. "Dashashwamedh Ghat")
 * @returns {Promise<{ description: string|null, imageUrl: string|null }>}
 *   - description: First 3 sentences of the Wikipedia intro, or null if no article
 *   - imageUrl: Thumbnail URL (400px wide), or null if no image
 *
 * @example
 * const info = await fetchWikiSummary('Sarnath');
 * // { description: "Sarnath is a place located...", imageUrl: "https://upload..." }
 */
export const fetchWikiSummary = async (siteName) => {
  // Build the API URL with query parameters.
  // - action=query: We're querying article data (not editing or searching)
  // - prop=extracts|pageimages: Fetch both text summary and image
  // - exintro=true: Only the intro section (before the first heading)
  // - exsentences=3: Limit to 3 sentences — enough for a card description
  // - explaintext=true: Return plain text, not HTML (cleaner for our UI)
  // - pithumbsize: Requested thumbnail width in pixels
  // - origin=*: Required for CORS when calling from Node.js
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: siteName,
    prop: 'extracts|pageimages',
    exintro: 'true',
    exsentences: '3',
    explaintext: 'true',
    pithumbsize: String(THUMBNAIL_WIDTH),
    origin: '*'
  });

  const url = `${WIKI_API_BASE}?${params.toString()}`;

  try {
    // Fetch the Wikipedia API response
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`  ⚠️  Wikipedia API returned ${response.status} for "${siteName}"`);
      return { description: null, imageUrl: null };
    }

    const data = await response.json();
    const pages = data.query?.pages;

    if (!pages) {
      return { description: null, imageUrl: null };
    }

    // The API returns pages keyed by page ID. We take the first (and only) result.
    // If the page doesn't exist, the ID will be "-1".
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    // Page ID of -1 means "no article found" — the site name didn't match
    // any Wikipedia article (common for lesser-known temples)
    if (pageId === '-1' || !page) {
      return { description: null, imageUrl: null };
    }

    // Extract the plain-text summary (3 sentences of the article intro)
    const description = page.extract || null;

    // Extract the thumbnail URL if the article has an associated image
    const imageUrl = page.thumbnail?.source || null;

    return { description, imageUrl };

  } catch (error) {
    // Network errors, JSON parse failures, etc. — don't crash the whole pipeline
    console.warn(`  ⚠️  Wikipedia fetch failed for "${siteName}": ${error.message}`);
    return { description: null, imageUrl: null };
  }
};


/**
 * Returns a promise that resolves after the specified delay.
 * Used between Wikipedia API calls to respect rate limits.
 *
 * @param {number} [ms=300] - Delay in milliseconds
 * @returns {Promise<void>}
 */
export const rateLimitDelay = (ms = RATE_LIMIT_DELAY_MS) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
