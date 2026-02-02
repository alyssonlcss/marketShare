import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({ access_token: 'token' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login should delegate to AuthService', async () => {
    const req = { user: { username: 'user' } } as any;
    const result = await controller.login(req);

    expect(authService.login).toHaveBeenCalledWith(req.user);
    expect(result).toEqual({ access_token: 'token' });
  });
});
