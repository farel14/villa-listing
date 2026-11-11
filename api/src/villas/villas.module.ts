import { Module } from '@nestjs/common';
import { VillasController } from './villas.controller.js';
import { VillasService } from './villas.service.js';

@Module({
  controllers: [VillasController],
  providers: [VillasService],
})
export class VillasModule {}
