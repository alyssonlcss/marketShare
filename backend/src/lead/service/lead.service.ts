import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../entity/lead.entity';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { User } from '../../user/entity/user.entity';
import { FilterLeadDto } from '../dto/filter-lead.dto';

@Injectable()
export class LeadService {
    constructor(
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

    async create(createLeadDto: CreateLeadDto): Promise<Lead> {
        // Garante CPF único
        const existing = await this.leadRepository.findOne({ where: { cpf: createLeadDto.cpf } });
        if (existing) {
            throw new ConflictException('CPF já cadastrado para outro lead');
        }
        const lead = this.leadRepository.create(createLeadDto);
        return this.leadRepository.save(lead);
    }

    async findAll(userId: number, filters: FilterLeadDto = {}): Promise<any[]> {
        const userDistribuidorId = await this.getUserDistribuidorId(userId);

        const qb = this.leadRepository
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.propriedadesRurais', 'pr')
            .leftJoinAndSelect('pr.distribuidor', 'prDist')
            .leftJoinAndSelect('lead.distribuidor', 'd');

        // Cenário 1: Atribuído (distribuidorId enviado como parâmetro)
        // Retorna leads com propriedades que pertencem a este distribuidor
        if (typeof filters.distribuidorId === 'number') {
            qb.andWhere('pr.distribuidorId = :fDistribuidorId', { fDistribuidorId: filters.distribuidorId });
        } else {
            // Cenário 2: Não atribuído (sem distribuidorId no filtro)
            // Retorna leads que possuem propriedades SEM distribuidorId
            qb.andWhere('pr.distribuidorId IS NULL');
        }

        // Outros filtros opcionais
        if (filters.nome) {
            qb.andWhere('LOWER(lead.nome) LIKE LOWER(:nome)', { nome: `%${filters.nome}%` });
        }
        if (filters.cpf) {
            qb.andWhere('lead.cpf = :cpf', { cpf: filters.cpf });
        }
        if (filters.status) {
            qb.andWhere('lead.status = :status', { status: filters.status });
        }
        if (filters.comentario) {
            qb.andWhere('LOWER(lead.comentario) LIKE LOWER(:comentario)', { comentario: `%${filters.comentario}%` });
        }
        if (filters.email) {
            qb.andWhere('LOWER(lead.email) LIKE LOWER(:email)', { email: `%${filters.email}%` });
        }
        if (filters.telefone) {
            qb.andWhere('lead.telefone LIKE :telefone', { telefone: `%${filters.telefone}%` });
        }

        const leads = await qb.getMany();

        // Filtra as propriedades rurais de cada lead conforme o cenário
        return leads
            .map((lead) => {
                let filteredProperties = lead.propriedadesRurais || [];

                // Aplica o mesmo filtro de cenário nas propriedades
                if (typeof filters.distribuidorId === 'number') {
                    // Atribuído: apenas propriedades cujo distribuidor relacionado tem este id
                    filteredProperties = filteredProperties.filter(
                        (p) => p.distribuidor && p.distribuidor.id === filters.distribuidorId,
                    );
                } else {
                    // Não atribuído: apenas propriedades sem distribuidor associado
                    filteredProperties = filteredProperties.filter((p) => !p.distribuidor);
                }

                // Retorna apenas leads que tem propriedades após filtrar
                if (filteredProperties.length === 0) {
                    return null;
                }

                const { distribuidor, ...rest } = lead as any;
                return {
                    ...rest,
                    propriedadesRurais: filteredProperties,
                    distribuidorId: distribuidor ? distribuidor.id : null,
                };
            })
            .filter((lead) => lead !== null);
    }

    async findOne(id: number, userId: number): Promise<any> {
        const userDistribuidorId = await this.getUserDistribuidorId(userId);

        const qb = this.leadRepository
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.propriedadesRurais', 'pr')
            .leftJoinAndSelect('lead.distribuidor', 'd')
            .where('lead.id = :id', { id })
            .andWhere(
                '(lead.distribuidorId IS NULL ' +
                    'OR lead.distribuidorId = :distId ' +
                    'OR (lead.distribuidorId IS NOT NULL AND pr.distribuidorId IS NULL))',
                { distId: userDistribuidorId },
            );

        const lead = await qb.getOne();
        if (!lead) throw new NotFoundException('Lead not found');

        const { distribuidor, ...rest } = lead as any;
        return {
            ...rest,
            distribuidorId: distribuidor ? distribuidor.id : null,
        };
    }

    async update(id: number, updateLeadDto: UpdateLeadDto, userId: number): Promise<Lead> {
        // Garante que o lead pertence ao distribuidor do usuário logado
        await this.findOne(id, userId);
        await this.leadRepository.update(id, updateLeadDto);
        return this.findOne(id, userId);
    }

    async remove(id: number, userId: number): Promise<void> {
        // Só remove se o lead pertencer ao distribuidor do usuário (ou estiver acessível pelas regras de filtro)
        const lead = await this.findOne(id, userId);
        await this.leadRepository.remove(lead);
    }
}
