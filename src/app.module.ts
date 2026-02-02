
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Lead } from './domain/entities/lead.entity';
import { PropriedadeRural } from './propriedade-rural/entity/propriedade-rural.entity';
import { Distribuidor } from './domain/entities/distribuidor.entity';
import { DistribuidorModule } from './distribuidor/module/distribuidor.module';
import { Produto } from './domain/entities/produto.entity';
import { User } from './user/entity/user.entity';
import { Credentials } from './domain/entities/credentials.entity';
import { LeadModule } from './lead/module/lead.module';
import { PropriedadeRuralModule } from './propriedade-rural/module/propriedade-rural.module';
import { ProdutoModule } from './produto/module/produto.module';
import { AuthModule } from './domain/auth/module/auth.module';
import { UserModule } from './user/module/user.module';
import { CredentialsModule } from './credentials/module/credentials.module';

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
    LeadModule,
    TypeOrmModule.forFeature([Lead, PropriedadeRural, Distribuidor, User, Credentials]),
    PropriedadeRuralModule,
    ProdutoModule,
    AuthModule,
    UserModule,
    CredentialsModule,
    DistribuidorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
