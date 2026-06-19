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
