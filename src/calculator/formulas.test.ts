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
    // (10*80) + (6.25*180) - (5*30) - 161 = 1614
    expect(bmrMifflinStJeor({ ...base, sex: 'female' })).toBe(1614);
  });
});

describe('bmrKatchMcArdle', () => {
  it('uses lean body mass at 15% body fat', () => {
    const lean = computeLeanMassKg(80, 15); // 68
    expect(bmrKatchMcArdle(lean)).toBe(1839);
  });
});

describe('bmrHarrisBenedict', () => {
  it('computes revised male BMR', () => {
    expect(bmrHarrisBenedict(base)).toBeCloseTo(1854, 0);
  });
});

describe('bmrCunningham', () => {
  it('computes from lean mass', () => {
    expect(bmrCunningham(68)).toBeCloseTo(1996, 0);
  });
});
