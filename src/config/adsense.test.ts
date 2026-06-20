import { describe, expect, it } from 'vitest';
import { isAdsenseConfigured, toAdsTxtPublisherId } from './adsense';

describe('isAdsenseConfigured', () => {
  it('is false when env vars are unset in test', () => {
    expect(isAdsenseConfigured()).toBe(false);
  });
});

describe('toAdsTxtPublisherId', () => {
  it('strips ca-pub prefix for ads.txt', () => {
    expect(toAdsTxtPublisherId('ca-pub-1234567890123456')).toBe('pub-1234567890123456');
  });
});
