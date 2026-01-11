import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distribuidor } from '../entity/distribuidor.entity';
import { DistribuidorService } from '../service/distribuidor.service';
import { DistribuidorController } from '../controller/distribuidor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Distribuidor])],
  providers: [DistribuidorService],
  controllers: [DistribuidorController],
  exports: [TypeOrmModule, DistribuidorService],
})
export class DistribuidorModule {}

