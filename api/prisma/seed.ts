/**
 * Demo seed data. Villas are fictional; regions/features mirror the kind of
 * categories used by Turkish villa-rental sites. Images come from picsum.photos
 * (seeded, so they are stable between runs).
 */
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const regions = [
  { slug: 'mugla', nameTr: 'Muğla', nameEn: 'Muğla' },
  { slug: 'antalya', nameTr: 'Antalya', nameEn: 'Antalya' },
  { slug: 'sapanca', nameTr: 'Sapanca', nameEn: 'Sapanca' },
  { slug: 'izmir', nameTr: 'İzmir', nameEn: 'İzmir' },
  { slug: 'kusadasi', nameTr: 'Kuşadası', nameEn: 'Kuşadası' },
];

const features = [
  { slug: 'private-pool', nameTr: 'Özel Havuzlu', nameEn: 'Private Pool' },
  { slug: 'jacuzzi', nameTr: 'Jakuzili', nameEn: 'Jacuzzi' },
  { slug: 'pet-friendly', nameTr: 'Evcil Hayvan Dostu', nameEn: 'Pet Friendly' },
  { slug: 'honeymoon', nameTr: 'Balayı Villası', nameEn: 'Honeymoon Villa' },
  { slug: 'sea-view', nameTr: 'Deniz Manzaralı', nameEn: 'Sea View' },
  { slug: 'lake-view', nameTr: 'Göl Manzaralı', nameEn: 'Lake View' },
  { slug: 'kids-pool', nameTr: 'Çocuk Havuzlu', nameEn: 'Kids Pool' },
  { slug: 'secluded', nameTr: 'Korunaklı', nameEn: 'Secluded' },
];

type SeedVilla = {
  slug: string;
  name: string;
  region: string;
  district: string;
  price: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  tr: string;
  en: string;
};

const villas: SeedVilla[] = [
  {
    slug: 'villa-zeytin', name: 'Villa Zeytin', region: 'mugla', district: 'Fethiye',
    price: 6500, capacity: 6, bedrooms: 3, bathrooms: 3,
    features: ['private-pool', 'secluded', 'kids-pool'],
    tr: 'Zeytin ağaçları arasında, korunaklı havuzu olan 3 yatak odalı aile villası.',
    en: 'A 3-bedroom family villa among olive trees with a secluded private pool.',
  },
  {
    slug: 'villa-mavi-koy', name: 'Villa Mavi Koy', region: 'mugla', district: 'Göcek',
    price: 12800, capacity: 8, bedrooms: 4, bathrooms: 4,
    features: ['private-pool', 'sea-view', 'jacuzzi'],
    tr: 'Göcek koylarına bakan, jakuzili ve sonsuzluk havuzlu lüks villa.',
    en: 'Luxury villa overlooking the Göcek bays, with an infinity pool and jacuzzi.',
  },
  {
    slug: 'villa-kelebek', name: 'Villa Kelebek', region: 'mugla', district: 'Ölüdeniz',
    price: 4200, capacity: 2, bedrooms: 1, bathrooms: 1,
    features: ['honeymoon', 'private-pool', 'secluded'],
    tr: 'Çiftler için tasarlanmış, tamamen korunaklı havuzlu balayı villası.',
    en: 'A fully secluded honeymoon villa with a private pool, designed for couples.',
  },
  {
    slug: 'villa-lavanta', name: 'Villa Lavanta', region: 'antalya', district: 'Kaş',
    price: 9400, capacity: 6, bedrooms: 3, bathrooms: 2,
    features: ['sea-view', 'private-pool', 'pet-friendly'],
    tr: 'Kaş merkezine yakın, Meis adası manzaralı evcil hayvan dostu villa.',
    en: 'Pet-friendly villa near Kaş centre with views towards Meis island.',
  },
  {
    slug: 'villa-gunes', name: 'Villa Güneş', region: 'antalya', district: 'Kalkan',
    price: 15500, capacity: 10, bedrooms: 5, bathrooms: 5,
    features: ['sea-view', 'private-pool', 'jacuzzi', 'kids-pool'],
    tr: 'Kalabalık aileler için 5 yatak odalı, çocuk havuzlu geniş villa.',
    en: 'Spacious 5-bedroom villa with a kids pool, ideal for large families.',
  },
  {
    slug: 'villa-orman', name: 'Villa Orman', region: 'sapanca', district: 'Kırkpınar',
    price: 5200, capacity: 4, bedrooms: 2, bathrooms: 1,
    features: ['jacuzzi', 'lake-view', 'honeymoon'],
    tr: 'Orman içinde, göl manzaralı ve iç mekan jakuzili bungalov.',
    en: 'Forest bungalow with lake views and an indoor jacuzzi.',
  },
  {
    slug: 'villa-gol-evi', name: 'Villa Göl Evi', region: 'sapanca', district: 'Maşukiye',
    price: 3500, capacity: 4, bedrooms: 2, bathrooms: 1,
    features: ['lake-view', 'pet-friendly'],
    tr: 'Sapanca gölüne yürüme mesafesinde, bahçeli ve evcil hayvan dostu ev.',
    en: 'Pet-friendly house with a garden, walking distance to Lake Sapanca.',
  },
  {
    slug: 'villa-ege', name: 'Villa Ege', region: 'izmir', district: 'Çeşme',
    price: 11000, capacity: 8, bedrooms: 4, bathrooms: 3,
    features: ['private-pool', 'sea-view'],
    tr: 'Çeşme Alaçatı yakınında, rüzgar sörfü plajlarına yakın modern villa.',
    en: 'Modern villa near Alaçatı, Çeşme, close to the windsurfing beaches.',
  },
  {
    slug: 'villa-defne', name: 'Villa Defne', region: 'kusadasi', district: 'Kuşadası',
    price: 7300, capacity: 6, bedrooms: 3, bathrooms: 2,
    features: ['private-pool', 'kids-pool', 'secluded'],
    tr: 'Kuşadası merkeze kısa mesafede, çocuk havuzlu korunaklı aile villası.',
    en: 'Secluded family villa with a kids pool, a short drive from Kuşadası centre.',
  },
  {
    slug: 'villa-yildiz', name: 'Villa Yıldız', region: 'mugla', district: 'Bodrum',
    price: 18800, capacity: 12, bedrooms: 6, bathrooms: 6,
    features: ['private-pool', 'sea-view', 'jacuzzi'],
    tr: 'Bodrum yarımadasında 6 yatak odalı, panoramik deniz manzaralı villa.',
    en: '6-bedroom villa on the Bodrum peninsula with panoramic sea views.',
  },
];

function images(slug: string): string[] {
  return [1, 2, 3].map((n) => `https://picsum.photos/seed/${slug}-${n}/1200/800`);
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  const userEmail = process.env.SEED_USER_EMAIL ?? 'user@example.com';
  const userPassword = process.env.SEED_USER_PASSWORD ?? 'User123!';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });
  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      name: 'Demo User',
      role: Role.USER,
      passwordHash: await bcrypt.hash(userPassword, 10),
    },
  });

  for (const r of regions) {
    await prisma.region.upsert({ where: { slug: r.slug }, update: r, create: r });
  }
  for (const f of features) {
    await prisma.feature.upsert({ where: { slug: f.slug }, update: f, create: f });
  }

  for (const v of villas) {
    const region = await prisma.region.findUniqueOrThrow({ where: { slug: v.region } });
    const data = {
      name: v.name,
      district: v.district,
      descriptionTr: v.tr,
      descriptionEn: v.en,
      pricePerNight: v.price,
      capacity: v.capacity,
      bedrooms: v.bedrooms,
      bathrooms: v.bathrooms,
      images: images(v.slug),
      regionId: region.id,
    };
    await prisma.villa.upsert({
      where: { slug: v.slug },
      update: { ...data, features: { set: v.features.map((slug) => ({ slug })) } },
      create: { slug: v.slug, ...data, features: { connect: v.features.map((slug) => ({ slug })) } },
    });
  }

  // One blocked range so the availability filter has something to exclude.
  const zeytin = await prisma.villa.findUniqueOrThrow({ where: { slug: 'villa-zeytin' } });
  await prisma.unavailability.deleteMany({ where: { villaId: zeytin.id } });
  const year = new Date().getUTCFullYear() + 1;
  await prisma.unavailability.create({
    data: {
      villaId: zeytin.id,
      startDate: new Date(Date.UTC(year, 6, 1)),
      endDate: new Date(Date.UTC(year, 6, 15)),
      note: 'Demo: already booked',
    },
  });

  console.log(`Seeded ${regions.length} regions, ${features.length} features, ${villas.length} villas.`);
  console.log(`Blocked villa-zeytin ${year}-07-01 → ${year}-07-15 (checkout day free).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
