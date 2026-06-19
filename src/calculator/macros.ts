// src/calculator/macros.ts

/** Inputs for macro gram calculation. */
export interface MacroInput {
  /** Target calorie intake for macro split. */
  calories: number;
  /** Body weight in kg (used for default protein calculation). */
  weightKg: number;
  /** When true, use custom percentage fields. */
  useCustomMacros: boolean;
  /** Protein percentage of total calories (custom mode). */
  proteinPercent: number;
  /** Fat percentage of total calories (custom mode). */
  fatPercent: number;
  /** Carbohydrate percentage of total calories (custom mode). */
  carbPercent: number;
}

/** Macro output in grams per day. */
export interface MacroResult {
  /** Daily protein in grams. */
  proteinGrams: number;
  /** Daily fat in grams. */
  fatGrams: number;
  /** Daily carbohydrate in grams. */
  carbGrams: number;
}

const PROTEIN_G_PER_KG = 1.8;
const DEFAULT_FAT_PERCENT = 25;
const KCAL_PER_GRAM_PROTEIN = 4;
const KCAL_PER_GRAM_CARB = 4;
const KCAL_PER_GRAM_FAT = 9;
const MAX_PROTEIN_CALORIE_PERCENT = 40;

/**
 * Calculates daily macro grams for a calorie target.
 * Default mode: 1.8 g/kg protein (capped at 40% calories), 25% fat, remainder carbs.
 */
export function calculateMacros(input: MacroInput): MacroResult {
  const { calories, weightKg, useCustomMacros } = input;

  if (useCustomMacros) {
    const proteinCalories = calories * (input.proteinPercent / 100);
    const fatCalories = calories * (input.fatPercent / 100);
    const carbCalories = calories * (input.carbPercent / 100);
    return {
      proteinGrams: Math.round(proteinCalories / KCAL_PER_GRAM_PROTEIN),
      fatGrams: Math.round(fatCalories / KCAL_PER_GRAM_FAT),
      carbGrams: Math.round(carbCalories / KCAL_PER_GRAM_CARB),
    };
  }

  const proteinByWeight = PROTEIN_G_PER_KG * weightKg;
  const proteinCalorieCap = calories * (MAX_PROTEIN_CALORIE_PERCENT / 100);
  const proteinCalories = Math.min(proteinByWeight * KCAL_PER_GRAM_PROTEIN, proteinCalorieCap);
  const proteinGrams = Math.round(proteinCalories / KCAL_PER_GRAM_PROTEIN);

  const fatCalories = calories * (DEFAULT_FAT_PERCENT / 100);
  const fatGrams = Math.round(fatCalories / KCAL_PER_GRAM_FAT);

  const carbCalories = calories - proteinGrams * KCAL_PER_GRAM_PROTEIN - fatGrams * KCAL_PER_GRAM_FAT;
  const carbGrams = Math.round(Math.max(0, carbCalories) / KCAL_PER_GRAM_CARB);

  return { proteinGrams, fatGrams, carbGrams };
}
