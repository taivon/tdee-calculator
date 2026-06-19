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
