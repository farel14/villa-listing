import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

// Requires a migrated + seeded database (see README).
describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health', () => request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' }));

  it('GET /villas filters by region and guests', async () => {
    const res = await request(app.getHttpServer()).get('/villas?region=mugla&guests=8').expect(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    for (const v of res.body.items) {
      expect(v.region.slug).toBe('mugla');
      expect(v.capacity).toBeGreaterThanOrEqual(8);
    }
  });

  it('GET /villas rejects half a date range', () =>
    request(app.getHttpServer()).get('/villas?checkIn=2030-01-01').expect(400));

  it('admin routes require a token', () => request(app.getHttpServer()).get('/admin/inquiries').expect(401));

  it('user token cannot reach admin routes', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'User123!' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/admin/inquiries')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(403);
  });
});
