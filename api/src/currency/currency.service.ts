import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface RatesResponse {
  base: 'TRY';
  /** Units of each currency per 1 TRY */
  rates: Record<Currency, number>;
  source: string;
  updatedAt: string;
  fallback: boolean;
}

const SOURCE_URL = 'https://open.er-api.com/v6/latest/TRY';
const TTL_MS = 60 * 60 * 1000;

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private cache?: { data: RatesResponse; expires: number };

  constructor(private readonly config: ConfigService) {}

  async rates(): Promise<RatesResponse> {
    if (this.cache && this.cache.expires > Date.now()) return this.cache.data;
    try {
      const data = await this.fetchLive();
      this.cache = { data, expires: Date.now() + TTL_MS };
      return data;
    } catch (e) {
      this.logger.warn(`Live FX fetch failed, using fallback rates: ${(e as Error).message}`);
      const data = this.fallback();
      // Retry the live source sooner when on fallback
      this.cache = { data, expires: Date.now() + 5 * 60 * 1000 };
      return data;
    }
  }

  private async fetchLive(): Promise<RatesResponse> {
    const res = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as {
      result?: string;
      time_last_update_utc?: string;
      rates?: Record<string, number>;
    };
    if (body.result !== 'success' || !body.rates) throw new Error('Unexpected response');
    const rates = {} as Record<Currency, number>;
    for (const c of CURRENCIES) {
      const r = c === 'TRY' ? 1 : body.rates[c];
      if (typeof r !== 'number' || !(r > 0)) throw new Error(`Missing rate for ${c}`);
      rates[c] = r;
    }
    return {
      base: 'TRY',
      rates,
      source: 'open.er-api.com (ExchangeRate-API)',
      updatedAt: body.time_last_update_utc
        ? new Date(body.time_last_update_utc).toISOString()
        : new Date().toISOString(),
      fallback: false,
    };
  }

  private fallback(): RatesResponse {
    let perUnit: Partial<Record<Currency, number>> = {};
    try {
      perUnit = JSON.parse(this.config.get<string>('FALLBACK_RATES_TRY_PER_UNIT') ?? '{}');
    } catch {
      /* ignore malformed env */
    }
    const rates = { TRY: 1 } as Record<Currency, number>;
    for (const c of CURRENCIES) {
      if (c === 'TRY') continue;
      const tryPerUnit = Number(perUnit[c]);
      if (tryPerUnit > 0) rates[c] = 1 / tryPerUnit;
    }
    return {
      base: 'TRY',
      rates,
      source: 'FALLBACK_RATES_TRY_PER_UNIT env',
      updatedAt: new Date().toISOString(),
      fallback: true,
    };
  }
}
