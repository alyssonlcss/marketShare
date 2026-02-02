import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from '../entity/produto.entity';
import { Distribuidor } from '../../distribuidor/entity/distribuidor.entity';
import { CreateProdutoDto } from '../dto/create-produto.dto';
import { UpdateProdutoDto } from '../dto/update-produto.dto';
import { User } from '../../user/entity/user.entity';
import { FilterProdutoDto } from '../dto/filter-produto.dto';

@Injectable()
export class ProdutoService {
    constructor(
        @InjectRepository(Produto)
        private readonly produtoRepository: Repository<Produto>,
        @InjectRepository(Distribuidor)
        private readonly distribuidorRepository: Repository<Distribuidor>,
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

    async create(dto: CreateProdutoDto, userId: number): Promise<Produto> {
        const userDistribuidorId = await this.getUserDistribuidorId(userId);
        const existing = await this.produtoRepository.findOne({ where: { nome: dto.nome } });
        if (existing) {
            throw new ConflictException('Produto com este nome já existe');
        }
        const distribuidor = await this.distribuidorRepository.findOne({ where: { id: userDistribuidorId } });
        if (!distribuidor) throw new NotFoundException('Distribuidor not found');
        const produto = this.produtoRepository.create({ ...dto, distribuidor });
        return this.produtoRepository.save(produto);
    }

    async findAll(userId: number, filters: FilterProdutoDto = {}): Promise<Produto[]> {
        const userDistribuidorId = await this.getUserDistribuidorId(userId);

        const qb = this.produtoRepository
            .createQueryBuilder('produto')
            .leftJoinAndSelect('produto.distribuidor', 'd')
            .where('d.id = :distId', { distId: userDistribuidorId });

        if (filters.nome) {
            qb.andWhere('LOWER(produto.nome) LIKE LOWER(:nome)', { nome: `%${filters.nome}%` });
        }
        if (filters.unidadeMedida) {
            qb.andWhere('produto.unidadeMedida = :unidadeMedida', { unidadeMedida: filters.unidadeMedida });
        }
        if (typeof filters.custoUnidade === 'number') {
            qb.andWhere('produto.custoUnidade = :custoUnidade', { custoUnidade: filters.custoUnidade });
        }
        if (typeof filters.distribuidorId === 'number') {
            // filtro extra por distribuidorId, além do do usuário
            qb.andWhere('d.id = :fDistribuidorId', { fDistribuidorId: filters.distribuidorId });
        }
        if (filters.categoria && filters.categoria.length > 0) {
            // Postgres: operador de sobreposição de arrays (&&)
            qb.andWhere('produto.categoria && :cats', { cats: filters.categoria });
        }

        return qb.getMany();
    }

    async findOne(id: number, userId: number): Promise<Produto> {
        const userDistribuidorId = await this.getUserDistribuidorId(userId);
        const produto = await this.produtoRepository.findOne({
            where: { id, distribuidor: { id: userDistribuidorId } },
            relations: ['distribuidor'],
        });
        if (!produto) throw new NotFoundException('Produto not found');
        return produto;
    }

    async update(id: number, dto: UpdateProdutoDto, userId: number): Promise<Produto> {
        const produto = await this.findOne(id, userId);
        if ((dto as any).distribuidorId && (dto as any).distribuidorId !== produto.distribuidor.id) {
            throw new ForbiddenException('Não é permitido alterar o distribuidor do produto');
        }
        Object.assign(produto, dto);
        return this.produtoRepository.save(produto);
    }

    async remove(id: number, userId: number): Promise<void> {
        const produto = await this.findOne(id, userId);
        await this.produtoRepository.remove(produto);
    }
}
