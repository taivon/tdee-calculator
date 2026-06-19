/** Biological sex used by BMR formulas. */
export type Sex = 'male' | 'female';

/** Unit system for height and weight inputs. */
export type UnitSystem = 'metric' | 'imperial';

/** Five-tier activity level keys. */
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

/** Supported BMR formula identifiers. */
export type FormulaId =
  | 'mifflin_st_jeor'
  | 'harris_benedict'
  | 'katch_mcardle'
  | 'cunningham';

/** Raw user inputs before validation. Empty strings mean "not entered". */
export interface CalculatorInput {
  /** User sex. */
  sex: Sex;
  /** Age in years. */
  age: string;
  /** Height in cm (metric) or total inches (imperial). */
  height: string;
  /** Weight in kg (metric) or lbs (imperial). */
  weight: string;
  /** Selected activity level. */
  activityLevel: ActivityLevel;
  /** Optional body fat percentage (enables lean-mass formulas). */
  bodyFatPercent: string;
  /** Display/input unit system. */
  unitSystem: UnitSystem;
  /** Active BMR formula; auto-set to katch_mcardle when body fat provided. */
  formula: FormulaId;
  /** Custom calorie offset for cut goal (positive number subtracted from TDEE). */
  cutOffset: number;
  /** Custom calorie offset for bulk goal (added to TDEE). */
  bulkOffset: number;
  /** Macro percentages (must sum to 100 when custom macros enabled). */
  proteinPercent: number;
  fatPercent: number;
  carbPercent: number;
  /** When true, use proteinPercent/fatPercent/carbPercent instead of defaults. */
  useCustomMacros: boolean;
}

/** Normalized metric values after validation passes. */
export interface ValidatedInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  bodyFatPercent: number | null;
  unitSystem: UnitSystem;
  formula: FormulaId;
  cutOffset: number;
  bulkOffset: number;
  proteinPercent: number;
  fatPercent: number;
  carbPercent: number;
  useCustomMacros: boolean;
}

/** Per-formula BMR result for comparison table. */
export interface FormulaResult {
  id: FormulaId;
  label: string;
  bmr: number;
  available: boolean;
}

/** Complete calculator output. */
export interface CalculatorResult {
  bmr: number;
  tdee: number;
  cutCalories: number;
  maintainCalories: number;
  bulkCalories: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  formulaResults: FormulaResult[];
}
