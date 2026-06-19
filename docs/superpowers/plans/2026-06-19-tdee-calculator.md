# TDEE Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a modern editorial-style TDEE calculator as a static Vite + TypeScript site on GitHub Pages, with live results, advanced options, content sections, privacy policy, and AdSense-ready ad slots.

**Architecture:** Single-page editorial site (`index.html`) with calculator logic in pure TypeScript modules under `src/calculator/`, DOM wiring in `src/ui/`, and editorial styling via vanilla CSS custom properties. Separate `privacy.html` for AdSense compliance. GitHub Actions builds `dist/` and deploys to `gh-pages`.

**Tech Stack:** Vite 6, TypeScript 5 (strict), Vitest, vanilla CSS, GitHub Actions + GitHub Pages

---

## File Map

| File | Responsibility |
|------|----------------|
| `src/calculator/types.ts` | Shared types: inputs, results, activity levels, units |
| `src/calculator/units.ts` | Metric ↔ imperial conversion helpers |
| `src/calculator/activity.ts` | Activity level multipliers and labels |
| `src/calculator/formulas.ts` | BMR formula implementations |
| `src/calculator/macros.ts` | Macro gram/percent calculations |
| `src/calculator/engine.ts` | Orchestrates validation → BMR → TDEE → goals → macros |
| `src/ui/calculator-form.ts` | Renders inputs, reads form state, validation hints |
| `src/ui/results-panel.ts` | Renders TDEE, goal cards, macro bar |
| `src/ui/advanced-panel.ts` | Collapsible advanced controls + formula comparison table |
| `src/ui/faq.ts` | FAQ accordion behavior |
| `src/main.ts` | App entry: wires form → engine → results |
| `src/styles/tokens.css` | Design tokens |
| `src/styles/base.css` | Reset, typography, global layout |
| `src/styles/calculator.css` | Calculator card, form, results |
| `src/styles/layout.css` | Header, hero, content sections, ad slots, footer |
| `index.html` | Page shell + static content sections |
| `privacy.html` | Privacy policy |
| `public/favicon.svg` | Site icon |
| `public/robots.txt` | Crawler rules |
| `vite.config.ts` | Vite + Vitest config, base path for GH Pages |
| `.github/workflows/deploy.yml` | CI deploy pipeline |

---

### Task 1: Scaffold Vite + TypeScript + Vitest

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` (minimal shell)
- Create: `src/main.ts` (placeholder)

- [ ] **Step 1: Initialize npm project**

Run from `/Users/taivon/Projects/tdee-calculator`:

```bash
npm create vite@latest . -- --template vanilla-ts
```

When prompted about non-empty directory, proceed (docs/ already exists).

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D vitest jsdom @types/node
```

- [ ] **Step 3: Configure Vitest in `vite.config.ts`**

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

/** Vite config for local dev and GitHub Pages production builds. */
export default defineConfig({
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Add scripts to `package.json`**

Ensure these scripts exist:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 5: Enable strict TypeScript in `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Verify dev server starts**

Run: `npm run dev`  
Expected: Vite dev server starts without errors (Ctrl+C to stop).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src/
git commit -m "chore: scaffold Vite + TypeScript + Vitest project"
```

---

### Task 2: Calculator Types

**Files:**
- Create: `src/calculator/types.ts`

- [ ] **Step 1: Create types file**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/calculator/types.ts
git commit -m "feat: add calculator domain types"
```

---

### Task 3: Activity Multipliers

**Files:**
- Create: `src/calculator/activity.ts`
- Create: `src/calculator/activity.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/calculator/activity.test.ts
import { describe, expect, it } from 'vitest';
import { ACTIVITY_LEVELS, getActivityMultiplier } from './activity';

describe('getActivityMultiplier', () => {
  it('returns 1.2 for sedentary', () => {
    expect(getActivityMultiplier('sedentary')).toBe(1.2);
  });

  it('returns 1.9 for very_active', () => {
    expect(getActivityMultiplier('very_active')).toBe(1.9);
  });
});

describe('ACTIVITY_LEVELS', () => {
  it('defines five levels', () => {
    expect(ACTIVITY_LEVELS).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/calculator/activity.test.ts`  
Expected: FAIL — module not found

- [ ] **Step 3: Implement activity module**

```typescript
// src/calculator/activity.ts
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
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/calculator/activity.test.ts`  
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/calculator/activity.ts src/calculator/activity.test.ts
git commit -m "feat: add activity level multipliers"
```

---

### Task 4: Unit Conversion

**Files:**
- Create: `src/calculator/units.ts`
- Create: `src/calculator/units.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/calculator/units.test.ts
import { describe, expect, it } from 'vitest';
import { inchesToCm, lbsToKg, cmToInches, kgToLbs } from './units';

describe('units', () => {
  it('converts inches to cm', () => {
    expect(inchesToCm(70)).toBeCloseTo(177.8, 1);
  });

  it('converts lbs to kg', () => {
    expect(lbsToKg(180)).toBeCloseTo(81.65, 1);
  });

  it('converts cm to inches', () => {
    expect(cmToInches(180)).toBeCloseTo(70.87, 1);
  });

  it('converts kg to lbs', () => {
    expect(kgToLbs(80)).toBeCloseTo(176.37, 1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/calculator/units.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement units module**

```typescript
// src/calculator/units.ts

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
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/calculator/units.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/calculator/units.ts src/calculator/units.test.ts
git commit -m "feat: add unit conversion helpers"
```

---

### Task 5: BMR Formulas

**Files:**
- Create: `src/calculator/formulas.ts`
- Create: `src/calculator/formulas.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/calculator/formulas.test.ts
import { describe, expect, it } from 'vitest';
import {
  bmrCunningham,
  bmrHarrisBenedict,
  bmrKatchMcArdle,
  bmrMifflinStJeor,
  computeLeanMassKg,
} from './formulas';

const base = { sex: 'male' as const, age: 30, heightCm: 180, weightKg: 80 };

describe('bmrMifflinStJeor', () => {
  it('computes expected male BMR', () => {
    // (10*80) + (6.25*180) - (5*30) + 5 = 1780
    expect(bmrMifflinStJeor(base)).toBe(1780);
  });

  it('computes expected female BMR', () => {
    expect(bmrMifflinStJeor({ ...base, sex: 'female' })).toBe(1649);
  });
});

describe('bmrKatchMcArdle', () => {
  it('uses lean body mass at 15% body fat', () => {
    const lean = computeLeanMassKg(80, 15); // 68
    expect(bmrKatchMcArdle(lean)).toBeCloseTo(1838.8, 1);
  });
});

describe('bmrHarrisBenedict', () => {
  it('computes revised male BMR', () => {
    expect(bmrHarrisBenedict(base)).toBeCloseTo(1866, 0);
  });
});

describe('bmrCunningham', () => {
  it('computes from lean mass', () => {
    expect(bmrCunningham(68)).toBeCloseTo(1996, 0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/calculator/formulas.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement formulas module**

```typescript
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
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/calculator/formulas.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/calculator/formulas.ts src/calculator/formulas.test.ts
git commit -m "feat: add BMR formula implementations"
```

---

### Task 6: Macro Calculations

**Files:**
- Create: `src/calculator/macros.ts`
- Create: `src/calculator/macros.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/calculator/macros.test.ts
import { describe, expect, it } from 'vitest';
import { calculateMacros } from './macros';

describe('calculateMacros', () => {
  it('uses default protein/fat/carb split', () => {
    const result = calculateMacros({
      calories: 2000,
      weightKg: 80,
      useCustomMacros: false,
      proteinPercent: 30,
      fatPercent: 25,
      carbPercent: 45,
    });
    // protein: 1.8 g/kg = 144g = 576 kcal; fat 25% = 500 kcal = 56g; carbs remainder
    expect(result.proteinGrams).toBe(144);
    expect(result.fatGrams).toBe(56);
    expect(result.carbGrams).toBe(236);
  });

  it('uses custom percentages when enabled', () => {
    const result = calculateMacros({
      calories: 2000,
      weightKg: 80,
      useCustomMacros: true,
      proteinPercent: 30,
      fatPercent: 30,
      carbPercent: 40,
    });
    expect(result.proteinGrams).toBe(150);
    expect(result.fatGrams).toBe(67);
    expect(result.carbGrams).toBe(200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/calculator/macros.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement macros module**

```typescript
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
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/calculator/macros.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/calculator/macros.ts src/calculator/macros.test.ts
git commit -m "feat: add macro calculation logic"
```

---

### Task 7: Calculator Engine

**Files:**
- Create: `src/calculator/engine.ts`
- Create: `src/calculator/engine.test.ts`

- [ ] **Step 1: Write failing integration test**

```typescript
// src/calculator/engine.test.ts
import { describe, expect, it } from 'vitest';
import { calculateTdee, validateInput } from './engine';
import type { CalculatorInput } from './types';

const validInput: CalculatorInput = {
  sex: 'male',
  age: '30',
  height: '180',
  weight: '80',
  activityLevel: 'moderate',
  bodyFatPercent: '',
  unitSystem: 'metric',
  formula: 'mifflin_st_jeor',
  cutOffset: 500,
  bulkOffset: 300,
  proteinPercent: 30,
  fatPercent: 25,
  carbPercent: 45,
  useCustomMacros: false,
};

describe('validateInput', () => {
  it('returns validated metric values for valid input', () => {
    const result = validateInput(validInput);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.weightKg).toBe(80);
    }
  });

  it('rejects out-of-range age', () => {
    const result = validateInput({ ...validInput, age: '10' });
    expect(result.ok).toBe(false);
  });
});

describe('calculateTdee', () => {
  it('computes TDEE for valid male input', () => {
    const validated = validateInput(validInput);
    if (!validated.ok) throw new Error('expected valid input');
    const result = calculateTdee(validated.value);
    // BMR 1780 * 1.55 = 2759
    expect(result.bmr).toBe(1780);
    expect(result.tdee).toBe(2759);
    expect(result.cutCalories).toBe(2259);
    expect(result.bulkCalories).toBe(3059);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/calculator/engine.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement engine module**

```typescript
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
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/calculator/engine.test.ts`  
Expected: PASS

- [ ] **Step 5: Run full test suite**

Run: `npm test`  
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/calculator/engine.ts src/calculator/engine.test.ts
git commit -m "feat: add calculator engine with validation"
```

---

### Task 8: Editorial CSS Foundation

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/layout.css`
- Modify: `index.html`, `src/main.ts`

- [ ] **Step 1: Create design tokens**

```css
/* src/styles/tokens.css */
:root {
  --color-bg: #faf9f7;
  --color-text: #2c2417;
  --color-text-muted: #8b7355;
  --color-border: #e8e4df;
  --color-accent: #c4715a;
  --color-accent-soft: #f3ebe6;
  --color-surface: #ffffff;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-serif: 'Lora', 'Source Serif 4', Georgia, serif;

  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --shadow-sm: 0 1px 3px rgba(44, 36, 23, 0.06);
  --max-width: 1100px;
}
```

- [ ] **Step 2: Create base styles**

```css
/* src/styles/base.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:wght@500;600&display=swap');
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
}

h1, h2, h3 {
  font-family: var(--font-serif);
  font-weight: 600;
  line-height: 1.25;
}

a { color: var(--color-accent); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Create layout styles (header, hero, sections, footer, ad slots)**

Create `src/styles/layout.css` with classes:
- `.site-header`, `.site-nav`, `.hero`, `.content-section`, `.ad-slot`, `.site-footer`, `.container`, `.faq-item`, `.faq-question`

Use editorial spacing, warm borders, max-width container centered.

- [ ] **Step 4: Import styles in `src/main.ts`**

```typescript
import './styles/base.css';
import './styles/layout.css';
```

- [ ] **Step 5: Verify page renders**

Run: `npm run dev` — confirm warm background and serif headings visible.

- [ ] **Step 6: Commit**

```bash
git add src/styles/ src/main.ts
git commit -m "feat: add editorial CSS foundation"
```

---

### Task 9: Page Shell + Static Content

**Files:**
- Modify: `index.html`
- Create: `src/ui/faq.ts`

- [ ] **Step 1: Build `index.html` page structure**

Include:
- `<header>` with wordmark "TDEE Calculator" and nav anchors: `#calculator`, `#faq`, link to `privacy.html`
- `<section class="hero">` with h1 + subtitle
- `<section id="calculator">` with empty `#calculator-app` mount point
- `<div class="ad-slot" data-ad-slot="banner-1" aria-hidden="true"></div>`
- `<section class="content-section">` explainer (~300 words) with h2 "What is TDEE?"
- `<div class="ad-slot" data-ad-slot="in-article-1" aria-hidden="true"></div>`
- `<section id="faq" class="content-section">` with 6 FAQ items using `<details><summary>`
- `<footer>` with disclaimer + privacy link + dynamic year via JS

FAQ questions (from spec):
1. What is TDEE and how is it calculated?
2. How accurate is this calculator?
3. Which formula should I use?
4. How do I pick the right activity level?
5. How many calories should I eat to lose weight?
6. What are macros and why do they matter?

- [ ] **Step 2: Add meta tags in `<head>`**

```html
<meta name="description" content="Free TDEE calculator — estimate your daily calorie needs for weight loss, maintenance, or muscle gain.">
<meta property="og:title" content="TDEE Calculator">
<meta property="og:description" content="Calculate your Total Daily Energy Expenditure with our free, accurate calculator.">
<meta property="og:type" content="website">
```

- [ ] **Step 3: Implement FAQ accessibility helper**

```typescript
// src/ui/faq.ts
/** Ensures only one FAQ item is open at a time for cleaner UX. */
export function initFaqAccordion(root: ParentNode = document): void {
  const items = root.querySelectorAll<HTMLDetailsElement>('#faq details');
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
}
```

- [ ] **Step 4: Wire FAQ in `src/main.ts`**

```typescript
import { initFaqAccordion } from './ui/faq';
initFaqAccordion();
document.getElementById('year')!.textContent = String(new Date().getFullYear());
```

Add `<span id="year"></span>` in footer.

- [ ] **Step 5: Commit**

```bash
git add index.html src/ui/faq.ts src/main.ts
git commit -m "feat: add page shell, explainer content, and FAQ"
```

---

### Task 10: Calculator UI

**Files:**
- Create: `src/styles/calculator.css`
- Create: `src/ui/calculator-form.ts`
- Create: `src/ui/results-panel.ts`
- Create: `src/ui/advanced-panel.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create calculator CSS**

Style `.calculator-grid` (2-col desktop, 1-col mobile), `.calculator-card`, `.form-field`, `.goal-cards`, `.macro-bar`, `.results-sticky`, `.mobile-sticky-bar`, `.formula-table`, `.validation-hint`.

- [ ] **Step 2: Implement `calculator-form.ts`**

Export:
- `createDefaultInput(): CalculatorInput`
- `renderCalculatorForm(mount: HTMLElement, onChange: (input: CalculatorInput) => void): { getInput: () => CalculatorInput }`

Default form fields: sex (radio), age, height, weight, activity (select populated from `ACTIVITY_LEVELS`).

- [ ] **Step 3: Implement `results-panel.ts`**

Export `renderResults(mount: HTMLElement, result: CalculatorResult | null): void`

Display:
- Large TDEE number with "Daily Energy Expenditure" label
- Three goal cards: Weight loss / Maintain / Muscle gain
- Macro bar with protein/fat/carb grams

Show em-dash when `result` is null.

- [ ] **Step 4: Implement `advanced-panel.ts`**

Inside `<details class="advanced-panel">`:
- Unit toggle (metric/imperial) — relabel height/weight placeholders on change
- Body fat % input
- Formula comparison table (from `result.formulaResults`)
- Cut/bulk offset sliders (100–1000, step 50)
- Custom macro sliders (protein/fat/carb, show live sum must equal 100%)

- [ ] **Step 5: Wire live updates in `src/main.ts`**

```typescript
import { calculateTdee, validateInput } from './calculator/engine';
import { renderCalculatorForm } from './ui/calculator-form';
import { renderResults } from './ui/results-panel';

const app = document.getElementById('calculator-app')!;
const resultsMount = document.createElement('div');
resultsMount.id = 'results-panel';
app.appendChild(resultsMount);

const form = renderCalculatorForm(app, (input) => {
  const validated = validateInput(input);
  if (!validated.ok) {
    renderResults(resultsMount, null);
    return;
  }
  renderResults(resultsMount, calculateTdee(validated.value));
});
```

- [ ] **Step 6: Manual smoke test**

Run: `npm run dev`  
Enter: male, 30, 180cm, 80kg, moderate → expect TDEE ≈ 2759.

- [ ] **Step 7: Commit**

```bash
git add src/styles/calculator.css src/ui/ src/main.ts
git commit -m "feat: add calculator UI with live results"
```

---

### Task 11: Privacy Policy Page

**Files:**
- Create: `privacy.html`

- [ ] **Step 1: Create privacy page**

Standalone HTML page matching editorial styles. Include sections:
- Information We Collect (none directly; AdSense cookies)
- Google AdSense and third-party vendors
- Cookies
- Contact information placeholder
- Last updated date

Link back to `index.html`. Reuse same CSS imports via relative paths or duplicate minimal header/footer.

- [ ] **Step 2: Verify navigation**

Run: `npm run dev` → visit `/privacy.html`  
Expected: Page loads, link back to calculator works.

- [ ] **Step 3: Commit**

```bash
git add privacy.html
git commit -m "feat: add privacy policy page for AdSense compliance"
```

---

### Task 12: Public Assets + Ad Placeholders

**Files:**
- Create: `public/favicon.svg`, `public/robots.txt`
- Modify: `index.html`

- [ ] **Step 1: Create favicon**

Simple SVG: circle or flame icon in terracotta `#c4715a`.

- [ ] **Step 2: Create robots.txt**

```
User-agent: *
Allow: /
Sitemap: /sitemap.xml
```

- [ ] **Step 3: Add commented AdSense script placeholder to `index.html`**

```html
<!-- Enable after AdSense approval:
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX"
  crossorigin="anonymous"></script>
-->
```

- [ ] **Step 4: Commit**

```bash
git add public/ index.html
git commit -m "feat: add favicon, robots.txt, and AdSense placeholders"
```

---

### Task 13: Production Build + GitHub Pages Deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Verify production build**

Run: `npm run build`  
Expected: `dist/` folder created with `index.html`, assets, `privacy.html`.

- [ ] **Step 2: Create deploy workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Preview locally**

Run: `npm run preview`  
Expected: Built site serves correctly at localhost.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
```

- [ ] **Step 5: Push to GitHub and enable Pages**

Create remote repo, push `main`, enable GitHub Pages source = GitHub Actions in repo Settings → Pages.

---

### Task 14: Launch Verification

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `npm test`  
Expected: All tests PASS

- [ ] **Step 2: Manual test cases**

| Input | Expected BMR | Expected TDEE (moderate) |
|-------|-------------|--------------------------|
| Male, 30, 180cm, 80kg | 1780 | 2759 |
| Female, 25, 165cm, 60kg | 1376 | 2133 |

- [ ] **Step 3: Responsive check**

Verify at 375px, 768px, 1280px widths — calculator stacks on mobile, sticky bar appears on scroll.

- [ ] **Step 4: Accessibility spot check**

Tab through all form fields. FAQ opens with keyboard. Color contrast acceptable.

- [ ] **Step 5: Lighthouse audit**

Run Chrome Lighthouse on production build. Target: Performance > 90, Accessibility > 95.

---

## Spec Coverage Check

| Spec requirement | Task |
|-----------------|------|
| Mifflin-St Jeor default | Task 5, 7 |
| Katch-McArdle when body fat entered | Task 5, 7 |
| Formula comparison table | Task 7, 10 |
| 5 activity levels | Task 3 |
| Cut/maintain/bulk targets | Task 7, 10 |
| Macro split default + custom | Task 6, 10 |
| Metric default, imperial toggle | Task 4, 10 |
| Validation rules | Task 7 |
| Editorial visual design | Task 8, 10 |
| Explainer + FAQ content | Task 9 |
| Ad slots (2) | Task 9, 12 |
| Privacy policy | Task 11 |
| GitHub Pages deploy | Task 13 |
| Meta/OG tags | Task 9 |
| Accessibility | Task 9, 10, 14 |
| Unit tests for formulas/macros/activity | Tasks 3–7 |

## Out of Scope (confirmed not in plan)

- Dark mode, backend, user accounts, blog, PWA, analytics, live AdSense (placeholder only until approval)
