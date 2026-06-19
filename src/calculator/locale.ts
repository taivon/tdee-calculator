import type { UnitSystem } from './types';
import { cmToInches, inchesToCm, kgToLbs, lbsToKg } from './units';

/** IANA time zones commonly used in the United States (excluding territories for simplicity). */
const US_TIME_ZONES = new Set([
  'America/New_York',
  'America/Detroit',
  'America/Kentucky/Louisville',
  'America/Kentucky/Monticello',
  'America/Indiana/Indianapolis',
  'America/Indiana/Vincennes',
  'America/Indiana/Winamac',
  'America/Indiana/Marengo',
  'America/Indiana/Petersburg',
  'America/Indiana/Vevay',
  'America/Chicago',
  'America/Indiana/Tell_City',
  'America/Indiana/Knox',
  'America/Menominee',
  'America/North_Dakota/Center',
  'America/North_Dakota/New_Salem',
  'America/North_Dakota/Beulah',
  'America/Denver',
  'America/Boise',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Juneau',
  'America/Sitka',
  'America/Metlakatla',
  'America/Yakutat',
  'America/Nome',
  'America/Adak',
  'Pacific/Honolulu',
]);

/**
 * Detects whether the visitor is likely in the United States using locale and timezone.
 * Used only for choosing a default unit system; users can always switch manually.
 */
export function isLikelyUnitedStates(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  if (languages.some((lang) => lang === 'en-US' || lang.endsWith('-US'))) {
    return true;
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return US_TIME_ZONES.has(timeZone);
  } catch {
    return false;
  }
}

/**
 * Picks the default unit system based on the visitor's locale.
 * US visitors get imperial; everyone else gets metric.
 */
export function detectDefaultUnitSystem(): UnitSystem {
  return isLikelyUnitedStates() ? 'imperial' : 'metric';
}

/**
 * Converts a height string from one unit system to another for display when toggling.
 * @param height - Raw height value in the source unit system.
 * @param from - Current unit system of `height`.
 * @param to - Target unit system.
 * @returns Converted height string rounded for display, or empty if input invalid.
 */
export function convertHeightValue(
  height: string,
  from: UnitSystem,
  to: UnitSystem,
): string {
  if (!height.trim() || from === to) {
    return height;
  }

  const parsed = Number(height);
  if (!Number.isFinite(parsed)) {
    return '';
  }

  if (from === 'metric' && to === 'imperial') {
    return String(Math.round(cmToInches(parsed)));
  }

  if (from === 'imperial' && to === 'metric') {
    return String(Math.round(inchesToCm(parsed)));
  }

  return height;
}

/**
 * Converts a weight string from one unit system to another for display when toggling.
 * @param weight - Raw weight value in the source unit system.
 * @param from - Current unit system of `weight`.
 * @param to - Target unit system.
 * @returns Converted weight string rounded for display, or empty if input invalid.
 */
export function convertWeightValue(
  weight: string,
  from: UnitSystem,
  to: UnitSystem,
): string {
  if (!weight.trim() || from === to) {
    return weight;
  }

  const parsed = Number(weight);
  if (!Number.isFinite(parsed)) {
    return '';
  }

  if (from === 'metric' && to === 'imperial') {
    return String(Math.round(kgToLbs(parsed)));
  }

  if (from === 'imperial' && to === 'metric') {
    return String(Math.round(lbsToKg(parsed)));
  }

  return weight;
}
