import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { User } from '../../user/entity/user.entity';
import { FilterLeadDto } from '../dto/filter-lead.dto';
import { PropriedadeRural } from '../../propriedade-rural/entity/propriedade-rural.entity';

@Injectable()
export class LeadService {
    constructor(
        @InjectRepository(Lead)
        private readonly leadRepository: Repository<Lead>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PropriedadeRural)
        private readonly propriedadeRepository: Repository<PropriedadeRural>,
    ) {}

    private async getUserDistribuidorId(userId: number): Promise<number> {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['distribuidor'] });
        if (!user || !user.distribuidor) {
            throw new ForbiddenException('Usuário não possui distribuidor associado');
        }
        return user.distribuidor.id;
    }

    async create(createLeadDto: CreateLeadDto): Promise<Lead> {
        // Garante CPF, email e telefone únicos
        const { cpf, email, telefone, propriedade, distribuidorId, ...leadData } = createLeadDto;

        const existingCpf = await this.leadRepository.findOne({ where: { cpf } });
        if (existingCpf) {
            throw new ConflictException('CPF já cadastrado para outro lead');
        }

        if (email) {
            const existingEmail = await this.leadRepository.findOne({ where: { email } });
            if (existingEmail) {
                throw new ConflictException('Email já cadastrado para outro lead');
            }
        }

        if (telefone) {
            const existingTelefone = await this.leadRepository.findOne({ where: { telefone } });
            if (existingTelefone) {
                throw new ConflictException('Telefone já cadastrado para outro lead');
            }
        }

        const lead = this.leadRepository.create({
            ...leadData,
            cpf,
            email,
            telefone,
            ...(typeof distribuidorId === 'number'
                ? { distribuidor: { id: distribuidorId } as any }
                : {}),
        });
        const savedLead = await this.leadRepository.save(lead);

        // Cria a propriedade rural associada
        const propriedadeEntity = this.propriedadeRepository.create({
            ...propriedade,
            lead: savedLead,
        });
        await this.propriedadeRepository.save(propriedadeEntity);

        // Retorna o lead com suas propriedades carregadas
        const reloaded = await this.leadRepository.findOne({
            where: { id: savedLead.id },
            relations: ['propriedadesRurais'],
        });

        if (!reloaded) {
            throw new NotFoundException('Lead not found after creation');
        }

        return reloaded;
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
        const current = await this.leadRepository.findOne({ where: { id } });
        if (!current) {
            throw new NotFoundException('Lead not found');
        }
        await this.findOne(id, userId);

        const { email, telefone, propriedade, distribuidorId, ...rest } = updateLeadDto as any;

        // Se email for informado e diferente, verifica duplicidade
        if (email && email !== current.email) {
            const existingEmail = await this.leadRepository.findOne({ where: { email } });
            if (existingEmail && existingEmail.id !== id) {
                throw new ConflictException('Email já cadastrado para outro lead');
            }
        }

        // Se telefone for informado e diferente, verifica duplicidade
        if (telefone && telefone !== current.telefone) {
            const existingTelefone = await this.leadRepository.findOne({ where: { telefone } });
            if (existingTelefone && existingTelefone.id !== id) {
                throw new ConflictException('Telefone já cadastrado para outro lead');
            }
        }

        // Monta entidade atualizada do lead
        const updatedLead: Lead = {
            ...current,
            ...rest,
            email: email ?? current.email,
            telefone: telefone ?? current.telefone,
        } as Lead;

        // Atualiza relação de distribuidor se distribuidorId vier no PATCH
        if (distribuidorId !== undefined) {
            if (distribuidorId === null) {
                (updatedLead as any).distribuidor = null;
            } else {
                (updatedLead as any).distribuidor = { id: distribuidorId } as any;
            }
        }

        await this.leadRepository.save(updatedLead);

        // Opcionalmente atualiza a primeira propriedade rural associada, se enviada no PATCH
        if (propriedade) {
            const propriedades = await this.propriedadeRepository.find({
                where: { lead: { id } },
                order: { id: 'ASC' },
            });

            const propriedadeAtual = propriedades[0];
            if (propriedadeAtual) {
                const updatePayload: Partial<PropriedadeRural> = {};

                if (propriedade.nome !== undefined) updatePayload.nome = propriedade.nome;
                if (propriedade.cultura !== undefined) updatePayload.cultura = propriedade.cultura;
                if (propriedade.hectares !== undefined) updatePayload.hectares = propriedade.hectares;
                if (propriedade.uf !== undefined) updatePayload.uf = propriedade.uf;
                if (propriedade.cidade !== undefined) updatePayload.cidade = propriedade.cidade;
                if (propriedade.latitude !== undefined) updatePayload.latitude = propriedade.latitude;
                if (propriedade.longitude !== undefined) updatePayload.longitude = propriedade.longitude;

                if (Object.keys(updatePayload).length > 0) {
                    await this.propriedadeRepository.update(propriedadeAtual.id, updatePayload);
                }
            }
        }

        return this.findOne(id, userId);
    }

    async remove(id: number, userId: number): Promise<void> {
        // Só remove se o lead pertencer ao distribuidor do usuário (ou estiver acessível pelas regras de filtro)
        await this.findOne(id, userId);

        // Remove primeiro as propriedades rurais associadas a este lead para não violar FK
        await this.propriedadeRepository
            .createQueryBuilder()
            .delete()
            .where('leadId = :id', { id })
            .execute();

        // Depois remove o próprio lead
        await this.leadRepository.delete(id);
    }
}
