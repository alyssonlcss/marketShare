import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoController } from '../controller/produto.controller';
import { ProdutoService } from '../service/produto.service';

describe('ProdutoController', () => {
  let controller: ProdutoController;
  let service: ProdutoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutoController],
      providers: [
        {
          provide: ProdutoService,
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

    controller = module.get<ProdutoController>(ProdutoController);
    service = module.get<ProdutoService>(ProdutoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call ProdutoService.create with dto and userId', async () => {
    const req = { user: { userId: 1 } } as any;
    const dto = { nome: 'Produto' } as any;

    const result = await controller.create(req, dto);

    expect(service.create).toHaveBeenCalledWith(dto, 1);
    expect(result).toEqual({ id: 1 });
  });

  it('findAll should call ProdutoService.findAll', async () => {
    const req = { user: { userId: 1 } } as any;
    const result = await controller.findAll(req, {} as any);

    expect(service.findAll).toHaveBeenCalledWith(1, {} as any);
    expect(result).toEqual([]);
  });

  it('findOne should call ProdutoService.findOne with id and userId', async () => {
    const req = { user: { userId: 1 } } as any;

    const result = await controller.findOne(req, 1 as any);

    expect(service.findOne).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual({ id: 1 });
  });

  it('update should call ProdutoService.update with id, dto and userId', async () => {
    const req = { user: { userId: 1 } } as any;
    const dto = { nome: 'Atualizado' } as any;

    const result = await controller.update(req, 1 as any, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto, 1);
    expect(result).toEqual({ id: 1, nome: 'Atualizado' });
  });

  it('remove should call ProdutoService.remove with id and userId', async () => {
    const req = { user: { userId: 1 } } as any;

    await controller.remove(req, 1 as any);

    expect(service.remove).toHaveBeenCalledWith(1, 1);
  });
});
