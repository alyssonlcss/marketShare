import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credentials } from '../entity/credentials.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credentials])],
  exports: [TypeOrmModule],
})
export class CredentialsModule {}
