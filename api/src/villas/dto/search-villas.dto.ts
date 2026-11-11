import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { ISO_DATE } from '../../common/dates.js';

export const SORTS = ['recommended', 'price_asc', 'price_desc', 'newest'] as const;
export type Sort = (typeof SORTS)[number];

export class SearchVillasDto {
  @IsOptional() @IsString() @MaxLength(80)
  q?: string;

  /** Region slug, e.g. "mugla" */
  @IsOptional() @IsString() @MaxLength(60)
  region?: string;

  @IsOptional() @Matches(ISO_DATE, { message: 'checkIn must be YYYY-MM-DD' })
  checkIn?: string;

  @IsOptional() @Matches(ISO_DATE, { message: 'checkOut must be YYYY-MM-DD' })
  checkOut?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  guests?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(20)
  bedrooms?: number;

  /** TRY */
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  minPrice?: number;

  /** TRY */
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  maxPrice?: number;

  /** Comma-separated feature slugs; a villa must have all of them */
  @IsOptional() @IsString() @MaxLength(300)
  features?: string;

  @IsOptional() @IsIn(SORTS)
  sort?: Sort;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  pageSize?: number;
}
