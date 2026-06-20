/** AdSense publisher ID from the AdSense dashboard (format: ca-pub-XXXXXXXXXXXXXXXX). */
export const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT ?? '';

/** Ad unit slot ID for the banner below the calculator. */
export const ADSENSE_SLOT_BANNER = import.meta.env.VITE_ADSENSE_SLOT_BANNER ?? '';

/** Ad unit slot ID for the in-article placement between explainer and FAQ. */
export const ADSENSE_SLOT_IN_ARTICLE = import.meta.env.VITE_ADSENSE_SLOT_IN_ARTICLE ?? '';

/** Maps HTML `data-ad-slot` keys to configured AdSense unit slot IDs. */
export const ADSENSE_SLOT_MAP: Record<string, string> = {
  'banner-1': ADSENSE_SLOT_BANNER,
  'in-article-1': ADSENSE_SLOT_IN_ARTICLE,
};

/**
 * Returns true when all required AdSense environment variables are set.
 * Ads are skipped during local dev until `.env` is configured.
 */
export function isAdsenseConfigured(): boolean {
  return (
    ADSENSE_CLIENT.startsWith('ca-pub-') &&
    /^\d+$/.test(ADSENSE_SLOT_BANNER) &&
    /^\d+$/.test(ADSENSE_SLOT_IN_ARTICLE)
  );
}

/**
 * Converts a ca-pub client ID to the pub- format used in ads.txt.
 * @param client - AdSense client ID (ca-pub-...).
 */
export function toAdsTxtPublisherId(client: string): string {
  return client.replace(/^ca-pub-/, 'pub-');
}
