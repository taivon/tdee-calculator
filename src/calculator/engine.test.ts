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
