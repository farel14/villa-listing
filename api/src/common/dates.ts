import { BadRequestException } from '@nestjs/common';

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses YYYY-MM-DD as a UTC midnight Date (matches Postgres DATE columns). */
export function parseDate(value: string, field: string): Date {
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) {
    throw new BadRequestException(`${field} must be a valid date (YYYY-MM-DD)`);
  }
  return d;
}

export function parseRange(checkIn: string, checkOut: string) {
  const start = parseDate(checkIn, 'checkIn');
  const end = parseDate(checkOut, 'checkOut');
  if (end <= start) throw new BadRequestException('checkOut must be after checkIn');
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return { start, end, nights };
}

export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
