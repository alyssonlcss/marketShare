import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distribuidor } from '../entities/distribuidor.entity';

@Injectable()
export class DistribuidorService {
  constructor(
    @InjectRepository(Distribuidor)
    private readonly distribuidorRepository: Repository<Distribuidor>,
  ) {}

  findAll(): Promise<Distribuidor[]> {
    return this.distribuidorRepository.find();
  }
}
