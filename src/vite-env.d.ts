/// <reference types="vite/client" />

/** Vite environment variables for optional Google AdSense integration. */
interface ImportMetaEnv {
  /** Publisher ID from AdSense (ca-pub-XXXXXXXXXXXXXXXX). */
  readonly VITE_ADSENSE_CLIENT: string;
  /** Slot ID for the banner ad below the calculator. */
  readonly VITE_ADSENSE_SLOT_BANNER: string;
  /** Slot ID for the in-article ad between explainer and FAQ. */
  readonly VITE_ADSENSE_SLOT_IN_ARTICLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
