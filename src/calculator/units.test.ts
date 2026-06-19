import { describe, expect, it } from 'vitest';
import {
  cmToInches,
  feetInchesToInches,
  inchesToCm,
  inchesToFeetInches,
  kgToLbs,
  lbsToKg,
} from './units';

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

  it('round-trips feet and inches', () => {
    const total = feetInchesToInches(5, 9);
    expect(inchesToFeetInches(total)).toEqual({ feet: 5, inches: 9 });
  });
});
