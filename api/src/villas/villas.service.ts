import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { parseRange, todayUtc } from '../common/dates.js';
import { slugify } from '../common/slugify.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SearchVillasDto } from './dto/search-villas.dto.js';
import { CreateVillaDto, UpdateVillaDto } from './dto/villa-write.dto.js';

const villaInclude = {
  region: { select: { slug: true, nameTr: true, nameEn: true } },
  features: { select: { slug: true, nameTr: true, nameEn: true }, orderBy: { slug: 'asc' } },
} satisfies Prisma.VillaInclude;

@Injectable()
export class VillasService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchVillasDto) {
    const and: Prisma.VillaWhereInput[] = [{ isActive: true }];

    if (dto.region) and.push({ region: { slug: dto.region } });
    if (dto.guests) and.push({ capacity: { gte: dto.guests } });
    if (dto.bedrooms) and.push({ bedrooms: { gte: dto.bedrooms } });
    if (dto.minPrice !== undefined) and.push({ pricePerNight: { gte: dto.minPrice } });
    if (dto.maxPrice !== undefined) and.push({ pricePerNight: { lte: dto.maxPrice } });
    if (dto.q?.trim()) {
      const q = dto.q.trim();
      and.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { district: { contains: q, mode: 'insensitive' } },
        ],
      });
    }
    const featureSlugs = (dto.features ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    for (const slug of featureSlugs) and.push({ features: { some: { slug } } });

    if (dto.checkIn || dto.checkOut) {
      if (!dto.checkIn || !dto.checkOut) {
        throw new BadRequestException('checkIn and checkOut must be provided together');
      }
      const { start, end } = parseRange(dto.checkIn, dto.checkOut);
      // Exclude villas with any blocked range overlapping [start, end)
      and.push({ unavailable: { none: { startDate: { lt: end }, endDate: { gt: start } } } });
    }

    const orderBy: Prisma.VillaOrderByWithRelationInput =
      dto.sort === 'price_asc' ? { pricePerNight: 'asc' }
      : dto.sort === 'price_desc' ? { pricePerNight: 'desc' }
      : dto.sort === 'newest' ? { createdAt: 'desc' }
      : { code: 'asc' };

    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 12;
    const where: Prisma.VillaWhereInput = { AND: and };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.villa.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: villaInclude,
      }),
      this.prisma.villa.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findBySlug(slug: string) {
    const villa = await this.prisma.villa.findFirst({
      where: { slug, isActive: true },
      include: {
        ...villaInclude,
        unavailable: {
          where: { endDate: { gt: todayUtc() } },
          select: { startDate: true, endDate: true },
          orderBy: { startDate: 'asc' },
        },
      },
    });
    if (!villa) throw new NotFoundException('Villa not found');
    return villa;
  }

  listAll() {
    return this.prisma.villa.findMany({ orderBy: { code: 'asc' }, include: villaInclude });
  }

  async regions() {
    const regions = await this.prisma.region.findMany();
    // Postgres collation may not order Turkish letters (İ, Ş, Ç…) correctly
    return regions.sort((a, b) => a.nameTr.localeCompare(b.nameTr, 'tr'));
  }

  features() {
    return this.prisma.feature.findMany({ orderBy: { slug: 'asc' } });
  }

  async create(dto: CreateVillaDto) {
    const region = await this.requireRegion(dto.regionSlug);
    const { regionSlug: _r, featureSlugs, slug, ...rest } = dto;
    try {
      return await this.prisma.villa.create({
        data: {
          ...rest,
          slug: slug ?? slugify(dto.name),
          regionId: region.id,
          features: { connect: (featureSlugs ?? []).map((s) => ({ slug: s })) },
        },
        include: villaInclude,
      });
    } catch (e) {
      throw this.mapError(e);
    }
  }

  async update(id: string, dto: UpdateVillaDto) {
    const { regionSlug, featureSlugs, ...rest } = dto;
    const data: Prisma.VillaUpdateInput = { ...rest };
    if (regionSlug) data.region = { connect: { id: (await this.requireRegion(regionSlug)).id } };
    if (featureSlugs) data.features = { set: featureSlugs.map((s) => ({ slug: s })) };
    try {
      return await this.prisma.villa.update({ where: { id }, data, include: villaInclude });
    } catch (e) {
      throw this.mapError(e);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.villa.delete({ where: { id } });
    } catch (e) {
      throw this.mapError(e);
    }
    return { deleted: true };
  }

  private async requireRegion(slug: string) {
    const region = await this.prisma.region.findUnique({ where: { slug } });
    if (!region) throw new BadRequestException(`Unknown region "${slug}"`);
    return region;
  }

  private mapError(e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') return new ConflictException('Slug already in use');
      if (e.code === 'P2025') return new NotFoundException('Villa or feature not found');
    }
    return e;
  }
}
