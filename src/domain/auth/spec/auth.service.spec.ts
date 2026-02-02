import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../service/auth.service';
import { Credentials } from '../../entities/credentials.entity';
import { User } from '../../../user/entity/user.entity';
import { AuthUtils } from '../utils/auth.utils';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('AuthService', () => {
  let service: AuthService;
  let credentialsRepo: MockRepo<Credentials>;
  let userRepo: MockRepo<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed-token'),
          },
        },
        {
          provide: getRepositoryToken(Credentials),
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

    service = module.get<AuthService>(AuthService);
    credentialsRepo = module.get(getRepositoryToken(Credentials));
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validateUser should return null when credentials not found', async () => {
    (credentialsRepo.findOne as jest.Mock).mockResolvedValue(null);

    const result = await service.validateUser('user', 'password');

    expect(credentialsRepo.findOne).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('validateUser should return null when password is invalid', async () => {
    const credentials = {
      id: 1,
      username: 'user',
      passwordHash: 'hash',
      user: { id: 1, nome: 'User' },
    } as any;

    (credentialsRepo.findOne as jest.Mock).mockResolvedValue(credentials);
    const compareSpy = jest.spyOn(AuthUtils, 'comparePasswords').mockResolvedValue(false);

    const result = await service.validateUser('user', 'password');

    expect(compareSpy).toHaveBeenCalledWith('password', 'hash');
    expect(result).toBeNull();
  });

  it('validateUser should return user data without passwordHash when password is valid', async () => {
    const credentials = {
      id: 1,
      username: 'user',
      passwordHash: 'hash',
      user: { id: 1, nome: 'User' },
    } as any;

    (credentialsRepo.findOne as jest.Mock).mockResolvedValue(credentials);
    const compareSpy = jest.spyOn(AuthUtils, 'comparePasswords').mockResolvedValue(true);

    const result: any = await service.validateUser('user', 'password');

    expect(compareSpy).toHaveBeenCalledWith('password', 'hash');
    expect(result.user).toEqual(credentials.user);
    expect((result as any).passwordHash).toBeUndefined();
  });

  it('should return a token on successful login', async () => {
    const userPayload = {
      username: 'user',
      user: { id: 1, nome: 'User' },
    } as any;

    const result = await service.login(userPayload);

    expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, username: 'user' });
    expect(result).toEqual({ access_token: 'signed-token', user: userPayload.user });
  });
});
