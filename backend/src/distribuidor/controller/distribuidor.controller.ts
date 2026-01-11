import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { DistribuidorService } from '../service/distribuidor.service';

@UseGuards(JwtAuthGuard)
@Controller('distribuidor')
export class DistribuidorController {
  constructor(private readonly distribuidorService: DistribuidorService) {}

  @Get()
  findAll() {
    return this.distribuidorService.findAll();
  }
}
