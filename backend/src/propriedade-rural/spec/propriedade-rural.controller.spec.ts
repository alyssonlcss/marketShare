import { Test, TestingModule } from '@nestjs/testing';
import { PropriedadeRuralController } from '../controller/propriedade-rural.controller';
import { PropriedadeRuralService } from '../service/propriedade-rural.service';

describe('PropriedadeRuralController', () => {
  let controller: PropriedadeRuralController;
  let service: PropriedadeRuralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropriedadeRuralController],
      providers: [
        {
          provide: PropriedadeRuralService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 1 }),
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: 1 }),
            update: jest.fn().mockResolvedValue({ id: 1, cultura: 'Soja' }),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<PropriedadeRuralController>(PropriedadeRuralController);
    service = module.get<PropriedadeRuralService>(PropriedadeRuralService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call PropriedadeRuralService.create', async () => {
    const dto = { cultura: 'Soja' } as any;
    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1 });
  });

  it('findAll should call PropriedadeRuralService.findAll', async () => {
    const req = { user: { userId: 1 } } as any;
    const result = await controller.findAll(req, {} as any);

    expect(service.findAll).toHaveBeenCalledWith(1, {} as any);
    expect(result).toEqual([]);
  });

  it('findOne should call PropriedadeRuralService.findOne with id and userId', async () => {
    const req = { user: { userId: 1 } } as any;

    const result = await controller.findOne(req, 1 as any);

    expect(service.findOne).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual({ id: 1 });
  });

  it('update should call PropriedadeRuralService.update with id, dto and userId', async () => {
    const req = { user: { userId: 1 } } as any;
    const dto = { cultura: 'Soja' } as any;

    const result = await controller.update(req, 1 as any, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto, 1);
    expect(result).toEqual({ id: 1, cultura: 'Soja' });
  });

  it('remove should call PropriedadeRuralService.remove with id and userId', async () => {
    const req = { user: { userId: 1 } } as any;

    await controller.remove(req, 1 as any);

    expect(service.remove).toHaveBeenCalledWith(1, 1);
  });
});
