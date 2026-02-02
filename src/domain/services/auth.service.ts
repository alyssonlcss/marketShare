import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUtils } from '../utils/auth.utils'; // Caminho já está correto, mas verifique se o arquivo existe
import { Credentials } from '../../entities/credentials.entity';
import { User } from '../../../user/entity/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Credentials)
        private readonly credentialsRepo: Repository<Credentials>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        const credentials = await this.credentialsRepo.findOne({
            where: { username },
            relations: ['user', 'user.distribuidor'],
        });
        if (!credentials) return null;
        const valid = await AuthUtils.comparePasswords(password, credentials.passwordHash);
        if (!valid) return null;
        // Retorna dados do usuário sem senha
        const { passwordHash, ...credRest } = credentials;
        return {
            ...credRest,
            user: credentials.user,
        };
    }

    async login(user: any) {
        const payload = { sub: user.user.id, username: user.username };
        return {
            access_token: this.jwtService.sign(payload),
            user: user.user,
        };
    }
}
