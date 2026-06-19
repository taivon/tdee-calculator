// src/calculator/engine.ts
import { getActivityMultiplier } from './activity';
import { computeBmr, type BmrInput } from './formulas';
import { calculateMacros } from './macros';
import { toHeightCm, toWeightKg } from './units';
import type {
  CalculatorInput,
  CalculatorResult,
  FormulaId,
  FormulaResult,
  ValidatedInput,
} from './types';

/** Validation success wrapper. */
export type ValidationResult =
  | { ok: true; value: ValidatedInput }
  | { ok: false; fieldErrors: Partial<Record<keyof CalculatorInput, string>> };

const AGE_MIN = 15;
const AGE_MAX = 80;
const HEIGHT_CM_MIN = 120;
const HEIGHT_CM_MAX = 250;
const WEIGHT_KG_MIN = 30;
const WEIGHT_KG_MAX = 300;
const BODY_FAT_MIN = 3;
const BODY_FAT_MAX = 60;

function parseNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Validates raw form input and normalizes to metric internally.
 * @param input - Raw calculator form state.
 */
export function validateInput(input: CalculatorInput): ValidationResult {
  const fieldErrors: Partial<Record<keyof CalculatorInput, string>> = {};

  const age = parseNumber(input.age);
  if (age === null || age < AGE_MIN || age > AGE_MAX) {
    fieldErrors.age = `Enter an age between ${AGE_MIN} and ${AGE_MAX}.`;
  }

  const heightRaw = parseNumber(input.height);
  const weightRaw = parseNumber(input.weight);
  if (heightRaw === null) fieldErrors.height = 'Enter a valid height.';
  if (weightRaw === null) fieldErrors.weight = 'Enter a valid weight.';

  let heightCm: number | null = null;
  let weightKg: number | null = null;

  if (heightRaw !== null) {
    heightCm = toHeightCm(heightRaw, input.unitSystem);
    if (heightCm < HEIGHT_CM_MIN || heightCm > HEIGHT_CM_MAX) {
      fieldErrors.height = 'Height is out of supported range.';
    }
  }

  if (weightRaw !== null) {
    weightKg = toWeightKg(weightRaw, input.unitSystem);
    if (weightKg < WEIGHT_KG_MIN || weightKg > WEIGHT_KG_MAX) {
      fieldErrors.weight = 'Weight is out of supported range.';
    }
  }

  let bodyFatPercent: number | null = null;
  if (input.bodyFatPercent.trim() !== '') {
    const parsed = parseNumber(input.bodyFatPercent);
    if (parsed === null || parsed < BODY_FAT_MIN || parsed > BODY_FAT_MAX) {
      fieldErrors.bodyFatPercent = `Enter body fat between ${BODY_FAT_MIN}% and ${BODY_FAT_MAX}%.`;
    } else {
      bodyFatPercent = parsed;
    }
  }

  if (Object.keys(fieldErrors).length > 0 || heightCm === null || weightKg === null || age === null) {
    return { ok: false, fieldErrors };
  }

  const formula: FormulaId =
    bodyFatPercent !== null ? 'katch_mcardle' : input.formula === 'katch_mcardle' || input.formula === 'cunningham'
      ? 'mifflin_st_jeor'
      : input.formula;

  return {
    ok: true,
    value: {
      sex: input.sex,
      age,
      heightCm,
      weightKg,
      activityLevel: input.activityLevel,
      bodyFatPercent,
      unitSystem: input.unitSystem,
      formula,
      cutOffset: input.cutOffset,
      bulkOffset: input.bulkOffset,
      proteinPercent: input.proteinPercent,
      fatPercent: input.fatPercent,
      carbPercent: input.carbPercent,
      useCustomMacros: input.useCustomMacros,
    },
  };
}

/**
 * Builds BMR comparison rows for all supported formulas.
 * @param bmrInput - Normalized anthropometric inputs.
 * @param bodyFatPercent - Body fat percentage when provided; null otherwise.
 */
function buildFormulaResults(bmrInput: BmrInput, bodyFatPercent: number | null): FormulaResult[] {
  const formulas: Array<{ id: FormulaId; label: string; needsBodyFat: boolean }> = [
    { id: 'mifflin_st_jeor', label: 'Mifflin-St Jeor', needsBodyFat: false },
    { id: 'harris_benedict', label: 'Harris-Benedict', needsBodyFat: false },
    { id: 'katch_mcardle', label: 'Katch-McArdle', needsBodyFat: true },
    { id: 'cunningham', label: 'Cunningham', needsBodyFat: true },
  ];

  return formulas.map(({ id, label, needsBodyFat }) => {
    const available = !needsBodyFat || bodyFatPercent !== null;
    return {
      id,
      label,
      available,
      bmr: available ? computeBmr(id, bmrInput, bodyFatPercent) : 0,
    };
  });
}

/**
 * Computes full TDEE results from validated input.
 * @param input - Validated, metric-normalized input.
 */
export function calculateTdee(input: ValidatedInput): CalculatorResult {
  const bmrInput: BmrInput = {
    sex: input.sex,
    age: input.age,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
  };

  const bmr = computeBmr(input.formula, bmrInput, input.bodyFatPercent);
  const tdee = Math.round(bmr * getActivityMultiplier(input.activityLevel));
  const maintainCalories = tdee;
  const cutCalories = tdee - input.cutOffset;
  const bulkCalories = tdee + input.bulkOffset;

  const macros = calculateMacros({
    calories: maintainCalories,
    weightKg: input.weightKg,
    useCustomMacros: input.useCustomMacros,
    proteinPercent: input.proteinPercent,
    fatPercent: input.fatPercent,
    carbPercent: input.carbPercent,
  });

  return {
    bmr,
    tdee,
    cutCalories,
    maintainCalories,
    bulkCalories,
    proteinGrams: macros.proteinGrams,
    fatGrams: macros.fatGrams,
    carbGrams: macros.carbGrams,
    formulaResults: buildFormulaResults(bmrInput, input.bodyFatPercent),
  };
}
