import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PropriedadeRural } from '../entity/propriedade-rural.entity';
import { CreatePropriedadeRuralDto } from '../dto/create-propriedade-rural.dto';
import { UpdatePropriedadeRuralDto } from '../dto/update-propriedade-rural.dto';
import { Lead } from '../../lead/entity/lead.entity';
import { User } from '../../user/entity/user.entity';
import { FilterPropriedadeRuralDto } from '../dto/filter-propriedade-rural.dto';

@Injectable()
export class PropriedadeRuralService {
    constructor(
        @InjectRepository(PropriedadeRural)
        private readonly propriedadeRuralRepository: Repository<PropriedadeRural>,
        @InjectRepository(Lead)
        private readonly leadRepository: Repository<Lead>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    private async getUserDistribuidorId(userId: number): Promise<number> {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['distribuidor'] });
        if (!user || !user.distribuidor) {
            throw new ForbiddenException('Usuário não possui distribuidor associado');
        }
        return user.distribuidor.id;
    }

    async create(dto: CreatePropriedadeRuralDto): Promise<PropriedadeRural> {
        const lead = await this.leadRepository.findOne({ where: { id: dto.leadId } });
        if (!lead) throw new NotFoundException('Lead not found');
        const propriedade = this.propriedadeRuralRepository.create({
            ...dto,
            lead,
        });
        return this.propriedadeRuralRepository.save(propriedade);
    }

    async findAll(userId: number, filters: FilterPropriedadeRuralDto = {}): Promise<PropriedadeRural[]> {
        const userDistribuidorId = await this.getUserDistribuidorId(userId);

        const qb = this.propriedadeRuralRepository
            .createQueryBuilder('pr')
            .leftJoinAndSelect('pr.lead', 'lead')
            .leftJoinAndSelect('pr.distribuidor', 'd')
            .where('(d.id = :distId OR pr.distribuidorId IS NULL)', { distId: userDistribuidorId });

        if (filters.cultura) {
            qb.andWhere('LOWER(pr.cultura) LIKE LOWER(:cultura)', { cultura: `%${filters.cultura}%` });
        }
        if (filters.nome) {
            qb.andWhere('LOWER(pr.nome) LIKE LOWER(:nome)', { nome: `%${filters.nome}%` });
        }
        if (typeof filters.hectares === 'number') {
            qb.andWhere('pr.hectares = :hectares', { hectares: filters.hectares });
        }
        if (filters.uf) {
            qb.andWhere('LOWER(pr.uf) LIKE LOWER(:uf)', { uf: `%${filters.uf}%` });
        }
        if (filters.cidade) {
            qb.andWhere('LOWER(pr.cidade) LIKE LOWER(:cidade)', { cidade: `%${filters.cidade}%` });
        }
        if (filters.geometria) {
            qb.andWhere('LOWER(pr.geometria) LIKE LOWER(:geometria)', { geometria: `%${filters.geometria}%` });
        }
        if (typeof filters.leadId === 'number') {
            qb.andWhere('lead.id = :leadId', { leadId: filters.leadId });
        }
        if (typeof filters.distribuidorId === 'number') {
            qb.andWhere('d.id = :fDistribuidorId', { fDistribuidorId: filters.distribuidorId });
        }
        if (typeof filters.latitude === 'number') {
            qb.andWhere('pr.latitude = :latitude', { latitude: filters.latitude });
        }
        if (typeof filters.longitude === 'number') {
            qb.andWhere('pr.longitude = :longitude', { longitude: filters.longitude });
        }

        return qb.getMany();
    }

    async findOne(id: number, userId: number): Promise<PropriedadeRural> {
        const userDistribuidorId = await this.getUserDistribuidorId(userId);
        const propriedade = await this.propriedadeRuralRepository.findOne({
            where: [
                { id, distribuidor: { id: userDistribuidorId } },
                { id, distribuidor: IsNull() },
            ],
            relations: ['lead', 'distribuidor'],
        });
        if (!propriedade) throw new NotFoundException('Propriedade Rural not found');
        return propriedade;
    }

    async update(id: number, dto: UpdatePropriedadeRuralDto, userId: number): Promise<PropriedadeRural> {
        await this.propriedadeRuralRepository.update(id, dto);
        return this.findOne(id, userId);
    }

    async remove(id: number, userId: number): Promise<void> {
        const propriedade = await this.findOne(id, userId);
        await this.propriedadeRuralRepository.remove(propriedade);
    }
}
