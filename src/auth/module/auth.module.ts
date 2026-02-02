import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credentials } from '../../credentials/entity/credentials.entity';
import { User } from '../../user/entity/user.entity';
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { LocalStrategy } from '../service/local.strategy';
import { JwtStrategy } from '../service/jwt.strategy';
import { LocalAuthGuard } from '../guard/local-auth.guard';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([Credentials, User]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, LocalAuthGuard, JwtAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
