import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from '../entity/lead.entity';
import { PropriedadeRural } from '../../propriedade-rural/entity/propriedade-rural.entity';
import { User } from '../../user/entity/user.entity';
import { LeadService } from '../service/lead.service';
import { LeadController } from '../controller/lead.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, PropriedadeRural, User])],
  providers: [LeadService],
  controllers: [LeadController],
})
export class LeadModule {}
