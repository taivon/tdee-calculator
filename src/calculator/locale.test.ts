import { describe, expect, it } from 'vitest';
import {
  convertHeightValue,
  convertWeightValue,
  detectDefaultUnitSystem,
  isLikelyUnitedStates,
} from './locale';
import { feetInchesToInches, inchesToFeetInches } from './units';

describe('feetInchesToInches', () => {
  it('combines feet and inches', () => {
    expect(feetInchesToInches(5, 9)).toBe(69);
  });
});

describe('inchesToFeetInches', () => {
  it('splits total inches', () => {
    expect(inchesToFeetInches(69)).toEqual({ feet: 5, inches: 9 });
  });
});

describe('convertHeightValue', () => {
  it('converts cm to inches', () => {
    expect(convertHeightValue('180', 'metric', 'imperial')).toBe('71');
  });

  it('converts inches to cm', () => {
    expect(convertHeightValue('69', 'imperial', 'metric')).toBe('175');
  });
});

describe('convertWeightValue', () => {
  it('converts kg to lbs', () => {
    expect(convertWeightValue('80', 'metric', 'imperial')).toBe('176');
  });

  it('converts lbs to kg', () => {
    expect(convertWeightValue('180', 'imperial', 'metric')).toBe('82');
  });
});

describe('isLikelyUnitedStates', () => {
  it('returns a boolean', () => {
    expect(typeof isLikelyUnitedStates()).toBe('boolean');
  });
});

describe('detectDefaultUnitSystem', () => {
  it('returns metric or imperial', () => {
    expect(['metric', 'imperial']).toContain(detectDefaultUnitSystem());
  });
});
