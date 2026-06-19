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
    // protein: 1.8 g/kg = 144g = 576 kcal; fat 25% = 500 kcal = 56g; carbs remainder after rounded fat
    expect(result.proteinGrams).toBe(144);
    expect(result.fatGrams).toBe(56);
    expect(result.carbGrams).toBe(230);
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
