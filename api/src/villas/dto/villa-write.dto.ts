import { PartialType } from '@nestjs/mapped-types';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateVillaDto {
  @IsString() @MinLength(2) @MaxLength(120)
  name: string;

  /** Optional; generated from name when omitted */
  @IsOptional() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsString()
  regionSlug: string;

  @IsString() @MinLength(2) @MaxLength(80)
  district: string;

  @IsString() @MaxLength(5000)
  descriptionTr: string;

  @IsString() @MaxLength(5000)
  descriptionEn: string;

  /** Nightly price in TRY */
  @IsInt() @Min(1)
  pricePerNight: number;

  @IsInt() @Min(1) @Max(50)
  capacity: number;

  @IsInt() @Min(0) @Max(20)
  bedrooms: number;

  @IsInt() @Min(0) @Max(20)
  bathrooms: number;

  @IsArray() @ArrayMaxSize(20) @IsUrl({ require_tld: false }, { each: true })
  images: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  featureSlugs?: string[];

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class UpdateVillaDto extends PartialType(CreateVillaDto) {}
