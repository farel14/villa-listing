import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { CurrencyModule } from './currency/currency.module.js';
import { InquiriesModule } from './inquiries/inquiries.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { VillasModule } from './villas/villas.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    VillasModule,
    InquiriesModule,
    CurrencyModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
