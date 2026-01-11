import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoService } from '../service/produto.service';
import { Produto } from '../entity/produto.entity';
import { Distribuidor } from '../../distribuidor/entity/distribuidor.entity';
import { User } from '../../user/entity/user.entity';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProdutoService', () => {
  let service: ProdutoService;
  let produtoRepository: MockRepo<Produto>;
  let distribuidorRepository: MockRepo<Distribuidor>;
  let userRepository: MockRepo<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutoService,
        {
          provide: getRepositoryToken(Produto),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Distribuidor),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProdutoService>(ProdutoService);
    produtoRepository = module.get(getRepositoryToken(Produto));
    distribuidorRepository = module.get(getRepositoryToken(Distribuidor));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should throw ForbiddenException when user has no distribuidor', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: null } as User);

    await expect(
      service.create({ nome: 'Produto', distribuidorId: 1 } as any, 1),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('create should throw ConflictException when product name already exists', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: { id: 10 } } as any);
    (produtoRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 } as Produto);

    await expect(
      service.create({ nome: 'Produto', distribuidorId: 1 } as any, 1),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('create should throw NotFoundException when distribuidor not found', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: { id: 10 } } as any);
    (produtoRepository.findOne as jest.Mock).mockResolvedValue(null);
    (distribuidorRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      service.create({ nome: 'Produto', distribuidorId: 1 } as any, 1),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create should save product when data is valid', async () => {
    const user = { id: 1, distribuidor: { id: 10 } } as any;
    (userRepository.findOne as jest.Mock).mockResolvedValue(user);
    (produtoRepository.findOne as jest.Mock).mockResolvedValue(null);

    const distribuidor = { id: 10 } as Distribuidor;
    (distribuidorRepository.findOne as jest.Mock).mockResolvedValue(distribuidor);

    const dto = { nome: 'Produto', custoUnidade: 10 } as any;
    const created = { id: 1, ...dto, distribuidor } as Produto;

    (produtoRepository.create as jest.Mock).mockReturnValue(created);
    (produtoRepository.save as jest.Mock).mockResolvedValue(created);

    const result = await service.create(dto, 1);

    expect(produtoRepository.create).toHaveBeenCalledWith({ ...dto, distribuidor });
    expect(produtoRepository.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('findAll should return products for user distribuidor', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: { id: 10 } } as any);

    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    (produtoRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const produtos = [{ id: 1, nome: 'Produto' } as Produto];
    qb.getMany.mockResolvedValue(produtos);

    const result = await service.findAll(1, {} as any);

    expect(produtoRepository.createQueryBuilder).toHaveBeenCalledWith('produto');
    expect(result).toEqual(produtos);
  });

  it('findOne should return product when found', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: { id: 10 } } as any);

    const produto = { id: 1, nome: 'Produto', distribuidor: { id: 10 } } as Produto;
    (produtoRepository.findOne as jest.Mock).mockResolvedValue(produto);

    const result = await service.findOne(1, 1);

    expect(produtoRepository.findOne).toHaveBeenCalled();
    expect(result).toEqual(produto);
  });

  it('findOne should throw NotFoundException when product not found', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: { id: 10 } } as any);
    (produtoRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.findOne(1, 1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update should save product when distribuidor is not changed', async () => {
    const existing: any = { id: 1, nome: 'Produto', distribuidor: { id: 10 } };
    const updated: any = { ...existing, nome: 'Novo' };

    const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(existing);
    (produtoRepository.save as jest.Mock).mockResolvedValue(updated);

    const result = await service.update(1, { nome: 'Novo' } as any, 1);

    expect(findOneSpy).toHaveBeenCalledWith(1, 1);
    expect(produtoRepository.save).toHaveBeenCalledWith(updated);
    expect(result).toEqual(updated);
  });

  it('update should throw ForbiddenException when trying to change distribuidor', async () => {
    const existing: any = { id: 1, nome: 'Produto', distribuidor: { id: 10 } };

    jest.spyOn(service, 'findOne').mockResolvedValue(existing);

    await expect(
      service.update(1, { distribuidorId: 99 } as any, 1),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(produtoRepository.save).not.toHaveBeenCalled();
  });

  it('remove should call repository.remove with product returned by findOne', async () => {
    const produto: any = { id: 1 };
    const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(produto);

    await service.remove(1, 1);

    expect(findOneSpy).toHaveBeenCalledWith(1, 1);
    expect(produtoRepository.remove).toHaveBeenCalledWith(produto);
  });
});
