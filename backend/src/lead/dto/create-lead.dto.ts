import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { LeadStatus } from '../entity/lead.entity';
import { IsCPF } from '../utils/cpf.validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsCPF({ message: 'cpf inválido' })
  cpf: string;

  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsNumber()
  @IsOptional()
  distribuidorId?: number;

  @IsString()
  @IsOptional()
  comentario?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[+0-9 ()-]{10,20}$/, {
    message:
      'telefone deve conter entre 10 e 20 caracteres e apenas dígitos, espaços, parênteses, traços e +',
  })
  telefone: string;
}
