import { InquiryStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ISO_DATE } from '../../common/dates.js';

export class CreateInquiryDto {
  @IsUUID()
  villaId: string;

  @Matches(ISO_DATE, { message: 'checkIn must be YYYY-MM-DD' })
  checkIn: string;

  @Matches(ISO_DATE, { message: 'checkOut must be YYYY-MM-DD' })
  checkOut: string;

  @Type(() => Number) @IsInt() @Min(1) @Max(50)
  guests: number;

  @IsString() @MinLength(2) @MaxLength(80)
  contactName: string;

  @IsOptional() @IsString() @Matches(/^[+0-9 ()-]{7,20}$/, { message: 'contactPhone is not a valid phone number' })
  contactPhone?: string;

  @IsOptional() @IsIn(['tr', 'en'])
  locale?: 'tr' | 'en';
}

export class UpdateInquiryStatusDto {
  @IsEnum(InquiryStatus)
  status: InquiryStatus;
}
