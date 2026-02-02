import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from '../entity/produto.entity';
import { Distribuidor } from '../../distribuidor/entity/distribuidor.entity';
import { User } from '../../user/entity/user.entity';
import { ProdutoService } from '../service/produto.service';
import { ProdutoController } from '../controller/produto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Produto, Distribuidor, User])],
  providers: [ProdutoService],
  controllers: [ProdutoController],
})
export class ProdutoModule {}
