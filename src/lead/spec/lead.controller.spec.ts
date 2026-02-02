import { Test, TestingModule } from '@nestjs/testing';
import { LeadController } from '../controller/lead.controller';
import { LeadService } from '../service/lead.service';

describe('LeadController', () => {
  let controller: LeadController;
  let service: LeadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadController],
      providers: [
        {
          provide: LeadService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 1 }),
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: 1 }),
            update: jest.fn().mockResolvedValue({ id: 1, nome: 'Atualizado' }),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<LeadController>(LeadController);
    service = module.get<LeadService>(LeadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call LeadService.create', async () => {
    const dto = { nome: 'Lead' } as any;
    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1 });
  });

  it('findAll should call LeadService.findAll', async () => {
    const req = { user: { userId: 1 } } as any;
    const result = await controller.findAll(req, {} as any);

    expect(service.findAll).toHaveBeenCalledWith(1, {} as any);
    expect(result).toEqual([]);
  });

  it('findOne should call LeadService.findOne with id and userId', async () => {
    const req = { user: { userId: 1 } } as any;
    const result = await controller.findOne(req, 1 as any);

    expect(service.findOne).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual({ id: 1 });
  });

  it('patch should call LeadService.update with id, dto and userId', async () => {
    const req = { user: { userId: 1 } } as any;
    const dto = { nome: 'Atualizado via PATCH' } as any;
    const result = await controller.patch(req, 1 as any, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto, 1);
    expect(result).toEqual({ id: 1, nome: 'Atualizado' });
  });

  it('remove should call LeadService.remove with id and userId', async () => {
    const req = { user: { userId: 1 } } as any;

    await controller.remove(req, 1 as any);

    expect(service.remove).toHaveBeenCalledWith(1, 1);
  });
});
