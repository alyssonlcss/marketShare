import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropriedadeRuralService } from '../service/propriedade-rural.service';
import { PropriedadeRural } from '../entity/propriedade-rural.entity';
import { Lead } from '../../lead/entity/lead.entity';
import { User } from '../../user/entity/user.entity';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('PropriedadeRuralService', () => {
  let service: PropriedadeRuralService;
  let propriedadeRepository: MockRepo<PropriedadeRural>;
  let leadRepository: MockRepo<Lead>;
  let userRepository: MockRepo<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropriedadeRuralService,
        {
          provide: getRepositoryToken(PropriedadeRural),
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
          provide: getRepositoryToken(Lead),
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

    service = module.get<PropriedadeRuralService>(PropriedadeRuralService);
    propriedadeRepository = module.get(getRepositoryToken(PropriedadeRural));
    leadRepository = module.get(getRepositoryToken(Lead));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should throw NotFoundException when lead does not exist', async () => {
    (leadRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      service.create({ leadId: 1, cultura: 'Soja', hectares: 10, uf: 'SP', cidade: 'São Paulo', latitude: 1, longitude: 1 } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll should throw ForbiddenException when user has no distribuidor', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: null } as User);

    await expect(service.findAll(1, {} as any)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('create should save property when lead exists', async () => {
    const lead = { id: 1 } as Lead;
    (leadRepository.findOne as jest.Mock).mockResolvedValue(lead);

    const dto = { leadId: 1, cultura: 'Soja', hectares: 10, uf: 'SP', cidade: 'São Paulo', latitude: 1, longitude: 1 } as any;
    const created = { id: 1, ...dto, lead } as PropriedadeRural;

    (propriedadeRepository.create as jest.Mock).mockReturnValue(created);
    (propriedadeRepository.save as jest.Mock).mockResolvedValue(created);

    const result = await service.create(dto);

    expect(propriedadeRepository.create).toHaveBeenCalledWith({ ...dto, lead });
    expect(propriedadeRepository.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('findAll should return properties for user distribuidor', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: { id: 10 } } as any);

    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    (propriedadeRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const propriedades = [{ id: 1 } as PropriedadeRural];
    qb.getMany.mockResolvedValue(propriedades);

    const result = await service.findAll(1, {} as any);

    expect(propriedadeRepository.createQueryBuilder).toHaveBeenCalledWith('pr');
    expect(result).toEqual(propriedades);
  });

  it('findOne should return propriedade when found', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: { id: 10 } } as any);

    const propriedade = { id: 1 } as PropriedadeRural;
    (propriedadeRepository.findOne as jest.Mock).mockResolvedValue(propriedade);

    const result = await service.findOne(1, 1);

    expect(propriedadeRepository.findOne).toHaveBeenCalled();
    expect(result).toEqual(propriedade);
  });

  it('findOne should throw NotFoundException when propriedade not found', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, distribuidor: { id: 10 } } as any);
    (propriedadeRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.findOne(1, 1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update should call repository.update and return updated propriedade', async () => {
    const updated: any = { id: 1, cultura: 'Soja' };
    const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(updated);

    const result = await service.update(1, { cultura: 'Soja' } as any, 1);

    expect(propriedadeRepository.update).toHaveBeenCalledWith(1, { cultura: 'Soja' });
    expect(findOneSpy).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual(updated);
  });

  it('remove should call repository.remove with propriedade returned by findOne', async () => {
    const propriedade: any = { id: 1 };
    const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(propriedade);

    await service.remove(1, 1);

    expect(findOneSpy).toHaveBeenCalledWith(1, 1);
    expect(propriedadeRepository.remove).toHaveBeenCalledWith(propriedade);
  });
});
