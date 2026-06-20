import {
  ADSENSE_CLIENT,
  ADSENSE_SLOT_MAP,
  isAdsenseConfigured,
} from '../config/adsense';

declare global {
  interface Window {
    /** AdSense command queue populated by Google's script. */
    adsbygoogle: Record<string, unknown>[];
  }
}

/**
 * Loads the AdSense script and renders ad units into `[data-ad-slot]` containers.
 * No-ops when environment variables are missing so dev builds work without an account.
 */
export async function initAdsense(): Promise<void> {
  if (!isAdsenseConfigured()) {
    return;
  }

  await loadAdsenseScript(ADSENSE_CLIENT);

  document.querySelectorAll<HTMLElement>('[data-ad-slot]').forEach((container) => {
    const slotKey = container.dataset.adSlot ?? '';
    const slotId = ADSENSE_SLOT_MAP[slotKey];
    if (!slotId) {
      return;
    }
    mountAdUnit(container, ADSENSE_CLIENT, slotId);
  });
}

/**
 * Injects the async AdSense loader script once per page.
 * @param client - Publisher client ID (ca-pub-...).
 */
function loadAdsenseScript(client: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-adsense-script="true"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.adsenseScript = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google AdSense script'));
    document.head.appendChild(script);
  });
}

/**
 * Replaces a placeholder container with a responsive AdSense `<ins>` unit.
 * @param container - Placeholder element from the page template.
 * @param client - Publisher client ID.
 * @param slotId - Ad unit slot ID from the AdSense dashboard.
 */
function mountAdUnit(container: HTMLElement, client: string, slotId: string): void {
  container.classList.add('ad-slot--live');
  container.removeAttribute('aria-hidden');
  container.setAttribute('role', 'complementary');
  container.setAttribute('aria-label', 'Advertisement');

  const unit = document.createElement('ins');
  unit.className = 'adsbygoogle';
  unit.style.display = 'block';
  unit.dataset.adClient = client;
  unit.dataset.adSlot = slotId;
  unit.dataset.adFormat = 'auto';
  unit.dataset.fullWidthResponsive = 'true';

  container.replaceChildren(unit);

  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // Ad blockers can throw; calculator must keep working.
  }
}
