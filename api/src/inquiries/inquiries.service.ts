import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InquiryStatus, Prisma } from '@prisma/client';
import type { AuthUser } from '../auth/auth.types.js';
import { parseRange, todayUtc } from '../common/dates.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInquiryDto } from './dto/inquiry.dto.js';
import { buildWhatsAppMessage, buildWhatsAppUrl } from './whatsapp.js';

const listInclude = {
  villa: { select: { name: true, code: true, slug: true } },
  user: { select: { email: true, name: true } },
} satisfies Prisma.BookingInquiryInclude;

@Injectable()
export class InquiriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateInquiryDto, user?: AuthUser) {
    const { start, end, nights } = parseRange(dto.checkIn, dto.checkOut);
    if (start < todayUtc()) throw new BadRequestException('checkIn cannot be in the past');

    const villa = await this.prisma.villa.findFirst({ where: { id: dto.villaId, isActive: true } });
    if (!villa) throw new NotFoundException('Villa not found');
    if (dto.guests > villa.capacity) {
      throw new BadRequestException(`This villa hosts at most ${villa.capacity} guests`);
    }
    const clash = await this.prisma.unavailability.findFirst({
      where: { villaId: villa.id, startDate: { lt: end }, endDate: { gt: start } },
    });
    if (clash) throw new ConflictException('Villa is not available for the selected dates');

    const locale = dto.locale ?? 'tr';
    const inquiry = await this.prisma.bookingInquiry.create({
      data: {
        villaId: villa.id,
        userId: user?.id,
        checkIn: start,
        checkOut: end,
        guests: dto.guests,
        nights,
        totalPrice: nights * villa.pricePerNight,
        contactName: dto.contactName.trim(),
        contactPhone: dto.contactPhone?.trim() || null,
        locale,
      },
    });

    const webUrl = this.config.get<string>('PUBLIC_WEB_URL');
    const text = buildWhatsAppMessage({
      locale,
      villaName: villa.name,
      villaCode: villa.code,
      villaUrl: webUrl ? `${webUrl.replace(/\/$/, '')}/villas/${villa.slug}` : undefined,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      nights,
      guests: dto.guests,
      totalTry: inquiry.totalPrice,
      contactName: inquiry.contactName,
      contactPhone: inquiry.contactPhone,
      reference: inquiry.id.slice(0, 8).toUpperCase(),
    });

    // MVP: WhatsApp is mocked on the frontend. The message and the wa.me link
    // are still built here so switching to a real hand-off is a frontend change.
    return {
      inquiry,
      message: text,
      whatsappNumber: this.config.getOrThrow<string>('WHATSAPP_NUMBER'),
      whatsappUrl: buildWhatsAppUrl(this.config.getOrThrow<string>('WHATSAPP_NUMBER'), text),
    };
  }

  mine(userId: string) {
    return this.prisma.bookingInquiry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: listInclude,
    });
  }

  all() {
    return this.prisma.bookingInquiry.findMany({ orderBy: { createdAt: 'desc' }, include: listInclude });
  }

  async setStatus(id: string, status: InquiryStatus) {
    try {
      return await this.prisma.bookingInquiry.update({ where: { id }, data: { status }, include: listInclude });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('Inquiry not found');
      }
      throw e;
    }
  }
}
