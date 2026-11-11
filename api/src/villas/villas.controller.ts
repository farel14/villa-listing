import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard, RolesGuard } from '../auth/guards.js';
import { Roles } from '../auth/roles.decorator.js';
import { SearchVillasDto } from './dto/search-villas.dto.js';
import { CreateVillaDto, UpdateVillaDto } from './dto/villa-write.dto.js';
import { VillasService } from './villas.service.js';

@Controller()
export class VillasController {
  constructor(private readonly villas: VillasService) {}

  @Get('regions')
  regions() {
    return this.villas.regions();
  }

  @Get('features')
  features() {
    return this.villas.features();
  }

  @Get('villas')
  search(@Query() query: SearchVillasDto) {
    return this.villas.search(query);
  }

  /** Admin: every villa including inactive ones */
  @Get('admin/villas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  listAll() {
    return this.villas.listAll();
  }

  @Get('villas/:slug')
  findOne(@Param('slug') slug: string) {
    return this.villas.findBySlug(slug);
  }

  @Post('villas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateVillaDto) {
    return this.villas.create(dto);
  }

  @Patch('villas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVillaDto) {
    return this.villas.update(id, dto);
  }

  @Delete('villas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.villas.remove(id);
  }
}
