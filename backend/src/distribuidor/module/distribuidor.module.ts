import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distribuidor } from '../entity/distribuidor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Distribuidor])],
  exports: [TypeOrmModule],
})
export class DistribuidorModule {}
