import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropriedadeRural } from '../entity/propriedade-rural.entity';
import { PropriedadeRuralService } from '../service/propriedade-rural.service';
import { PropriedadeRuralController } from '../controller/propriedade-rural.controller';
import { Lead } from '../../lead/entity/lead.entity';
import { User } from '../../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PropriedadeRural, Lead, User])],
  providers: [PropriedadeRuralService],
  controllers: [PropriedadeRuralController],
})
export class PropriedadeRuralModule {}
