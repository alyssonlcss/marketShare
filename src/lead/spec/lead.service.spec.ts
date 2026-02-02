import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadService } from '../service/lead.service';
import { Lead } from '../entity/lead.entity';
import { User } from '../../user/entity/user.entity';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('LeadService', () => {
  let service: LeadService;
  let leadRepository: MockRepo<Lead>;
  let userRepository: MockRepo<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        {
          provide: getRepositoryToken(Lead),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
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

    service = module.get<LeadService>(LeadService);
    leadRepository = module.get(getRepositoryToken(Lead));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should throw ConflictException when CPF already exists', async () => {
    (leadRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 } as Lead);

    await expect(
      service.create({ cpf: '12345678901', nome: 'Teste' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('create should save lead when CPF is unique', async () => {
    (leadRepository.findOne as jest.Mock).mockResolvedValue(null);
    const dto = { cpf: '12345678901', nome: 'Teste' } as any;
    const created = { id: 1, ...dto } as Lead;

    (leadRepository.create as jest.Mock).mockReturnValue(dto);
    (leadRepository.save as jest.Mock).mockResolvedValue(created);

    const result = await service.create(dto);

    expect(leadRepository.create).toHaveBeenCalledWith(dto);
    expect(leadRepository.save).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });

  it('findAll should throw ForbiddenException when user has no distribuidor', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: null } as User);

    await expect(service.findAll(1, {} as any)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('findAll should return mapped leads for valid user', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: { id: 10 } } as any);

    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    (leadRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    qb.getMany.mockResolvedValue([
      {
        id: 1,
        nome: 'Teste',
        distribuidor: { id: 10 },
      } as any,
    ]);

    const result = await service.findAll(1, {} as any);

    expect(leadRepository.createQueryBuilder).toHaveBeenCalledWith('lead');
    expect(result).toEqual([
      {
        id: 1,
        nome: 'Teste',
        distribuidorId: 10,
      },
    ]);
  });

  it('findOne should return mapped lead when found', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: { id: 10 } } as any);

    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    (leadRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    qb.getOne.mockResolvedValue({ id: 1, nome: 'Lead', distribuidor: { id: 10 } } as any);

    const result = await service.findOne(1, 1);

    expect(result).toEqual({ id: 1, nome: 'Lead', distribuidorId: 10 });
  });

  it('findOne should throw NotFoundException when lead not found', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: { id: 10 } } as any);

    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    (leadRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);
    qb.getOne.mockResolvedValue(null);

    await expect(service.findOne(1, 1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update should call repository.update and return updated lead', async () => {
    const updatedLead: any = { id: 1, nome: 'Atualizado', distribuidorId: 10 };
    const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(updatedLead);

    const result = await service.update(1, { nome: 'Atualizado' } as any, 1);

    expect(findOneSpy).toHaveBeenCalledWith(1, 1);
    expect(leadRepository.update).toHaveBeenCalledWith(1, { nome: 'Atualizado' });
    expect(result).toEqual(updatedLead);
  });

  it('remove should call repository.remove with lead returned by findOne', async () => {
    const lead: any = { id: 1 };
    const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(lead);

    await service.remove(1, 1);

    expect(findOneSpy).toHaveBeenCalledWith(1, 1);
    expect(leadRepository.remove).toHaveBeenCalledWith(lead);
  });
});
