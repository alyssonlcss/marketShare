
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Lead } from './domain/entities/lead.entity';
import { PropriedadeRural } from './domain/entities/propriedade-rural.entity';
import { Distribuidor } from './domain/entities/distribuidor.entity';
import { Produto } from './domain/entities/produto.entity';
import { User } from './user/entity/user.entity';
import { Credentials } from './domain/entities/credentials.entity';
import { AuthModule } from './domain/auth/module/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT', '5432'), 10),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [Lead, PropriedadeRural, Distribuidor, Produto, User, Credentials],
        autoLoadEntities: true,
        synchronize: true, // Em produção usaria migrations invés de synchronize
      }),
    }),
    TypeOrmModule.forFeature([Lead, PropriedadeRural, Distribuidor, Produto, User, Credentials]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
