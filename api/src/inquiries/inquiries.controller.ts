import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { AuthUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '../auth/guards.js';
import { Roles } from '../auth/roles.decorator.js';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.dto.js';
import { InquiriesService } from './inquiries.service.js';

@Controller()
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  /** Records the booking request and returns a wa.me link with a prefilled message. */
  @Post('inquiries')
  @UseGuards(OptionalJwtAuthGuard)
  create(@Body() dto: CreateInquiryDto, @CurrentUser() user?: AuthUser) {
    return this.inquiries.create(dto, user);
  }

  @Get('inquiries/mine')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: AuthUser) {
    return this.inquiries.mine(user.id);
  }

  @Get('admin/inquiries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  all() {
    return this.inquiries.all();
  }

  @Patch('admin/inquiries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  setStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateInquiryStatusDto) {
    return this.inquiries.setStatus(id, dto.status);
  }
}
