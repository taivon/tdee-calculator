// src/calculator/formulas.ts
import type { FormulaId, Sex } from './types';

/** Minimum inputs required by all BMR formulas. */
export interface BmrInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
}

/**
 * Computes lean body mass in kilograms from total weight and body fat percentage.
 * @param weightKg - Total body weight in kg.
 * @param bodyFatPercent - Body fat percentage (3–60).
 */
export function computeLeanMassKg(weightKg: number, bodyFatPercent: number): number {
  return weightKg * (1 - bodyFatPercent / 100);
}

/**
 * Mifflin-St Jeor BMR — default formula for general population.
 * @param input - Sex, age, height (cm), weight (kg).
 */
export function bmrMifflinStJeor(input: BmrInput): number {
  const { sex, age, heightCm, weightKg } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

/**
 * Revised Harris-Benedict BMR (1984).
 * @param input - Sex, age, height (cm), weight (kg).
 */
export function bmrHarrisBenedict(input: BmrInput): number {
  const { sex, age, heightCm, weightKg } = input;
  if (sex === 'male') {
    return Math.round(88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age);
  }
  return Math.round(447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age);
}

/**
 * Katch-McArdle BMR based on lean body mass.
 * @param leanMassKg - Fat-free mass in kilograms.
 */
export function bmrKatchMcArdle(leanMassKg: number): number {
  return Math.round(370 + 21.6 * leanMassKg);
}

/**
 * Cunningham BMR based on lean body mass.
 * @param leanMassKg - Fat-free mass in kilograms.
 */
export function bmrCunningham(leanMassKg: number): number {
  return Math.round(500 + 22 * leanMassKg);
}

/**
 * Computes BMR for a specific formula ID.
 * @param formula - Formula to use.
 * @param input - Base anthropometric inputs.
 * @param bodyFatPercent - Required for lean-mass formulas; null otherwise.
 */
export function computeBmr(
  formula: FormulaId,
  input: BmrInput,
  bodyFatPercent: number | null,
): number {
  switch (formula) {
    case 'mifflin_st_jeor':
      return bmrMifflinStJeor(input);
    case 'harris_benedict':
      return bmrHarrisBenedict(input);
    case 'katch_mcardle': {
      if (bodyFatPercent === null) {
        throw new Error('Body fat required for Katch-McArdle');
      }
      return bmrKatchMcArdle(computeLeanMassKg(input.weightKg, bodyFatPercent));
    }
    case 'cunningham': {
      if (bodyFatPercent === null) {
        throw new Error('Body fat required for Cunningham');
      }
      return bmrCunningham(computeLeanMassKg(input.weightKg, bodyFatPercent));
    }
    default:
      throw new Error(`Unsupported formula: ${formula satisfies never}`);
  }
}
