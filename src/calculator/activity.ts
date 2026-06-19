import type { ActivityLevel } from './types';

/** Metadata for a single activity tier shown in the UI. */
export interface ActivityLevelInfo {
  /** Internal key stored in form state. */
  id: ActivityLevel;
  /** Short label for select/radio display. */
  label: string;
  /** User-facing description of weekly exercise habits. */
  description: string;
  /** Multiplier applied to BMR to estimate TDEE. */
  multiplier: number;
}

/** All supported activity levels in display order. */
export const ACTIVITY_LEVELS: ActivityLevelInfo[] = [
  { id: 'sedentary', label: 'Sedentary', description: 'Desk job, little or no exercise', multiplier: 1.2 },
  { id: 'light', label: 'Light', description: 'Light exercise 1–3 days/week', multiplier: 1.375 },
  { id: 'moderate', label: 'Moderate', description: 'Moderate exercise 3–5 days/week', multiplier: 1.55 },
  { id: 'active', label: 'Active', description: 'Hard exercise 6–7 days/week', multiplier: 1.725 },
  { id: 'very_active', label: 'Very Active', description: 'Very hard exercise or physical job', multiplier: 1.9 },
];

/**
 * Returns the activity multiplier for a given activity level.
 * @param level - Selected activity tier.
 */
export function getActivityMultiplier(level: ActivityLevel): number {
  const match = ACTIVITY_LEVELS.find((item) => item.id === level);
  if (!match) {
    throw new Error(`Unknown activity level: ${level}`);
  }
  return match.multiplier;
}
