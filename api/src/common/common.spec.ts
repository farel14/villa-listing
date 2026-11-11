import { BadRequestException } from '@nestjs/common';
import { parseRange } from './dates.js';
import { slugify } from './slugify.js';

describe('slugify', () => {
  it('handles Turkish characters', () => {
    expect(slugify('Villa Çınar Göl Evi İş')).toBe('villa-cinar-gol-evi-is');
  });
});

describe('parseRange', () => {
  it('counts nights', () => {
    expect(parseRange('2030-01-30', '2030-02-02').nights).toBe(3);
  });
  it('rejects impossible dates and reversed ranges', () => {
    expect(() => parseRange('2030-02-30', '2030-03-01')).toThrow(BadRequestException);
    expect(() => parseRange('2030-03-02', '2030-03-01')).toThrow(BadRequestException);
  });
});
