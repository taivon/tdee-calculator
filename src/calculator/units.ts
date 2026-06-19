/** Converts inches to centimeters. */
export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

/** Converts centimeters to inches. */
export function cmToInches(cm: number): number {
  return cm / 2.54;
}

/** Converts pounds to kilograms. */
export function lbsToKg(lbs: number): number {
  return lbs * 0.45359237;
}

/** Converts kilograms to pounds. */
export function kgToLbs(kg: number): number {
  return kg / 0.45359237;
}

/** Feet and inches components of an imperial height. */
export interface FeetInches {
  /** Whole feet portion (e.g. 5 for 5'9"). */
  feet: number;
  /** Remaining inches (0–11). */
  inches: number;
}

/**
 * Combines feet and inches into total inches for BMR calculations.
 * @param feet - Whole feet.
 * @param inches - Inches portion (0–11).
 */
export function feetInchesToInches(feet: number, inches: number): number {
  return feet * 12 + inches;
}

/**
 * Splits total inches into feet and inches for imperial height inputs.
 * @param totalInches - Height expressed as total inches.
 */
export function inchesToFeetInches(totalInches: number): FeetInches {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  if (inches === 12) {
    return { feet: feet + 1, inches: 0 };
  }
  return { feet, inches };
}

/**
 * Normalizes height to centimeters based on the active unit system.
 * @param value - Height value as entered by the user.
 * @param unitSystem - `metric` expects cm; `imperial` expects total inches.
 */
export function toHeightCm(value: number, unitSystem: 'metric' | 'imperial'): number {
  return unitSystem === 'metric' ? value : inchesToCm(value);
}

/**
 * Normalizes weight to kilograms based on the active unit system.
 * @param value - Weight value as entered by the user.
 * @param unitSystem - `metric` expects kg; `imperial` expects lbs.
 */
export function toWeightKg(value: number, unitSystem: 'metric' | 'imperial'): number {
  return unitSystem === 'metric' ? value : lbsToKg(value);
}
