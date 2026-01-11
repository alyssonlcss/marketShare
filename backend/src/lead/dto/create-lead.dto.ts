import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, ValidateNested, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { LeadStatus } from '../entity/lead.entity';
import { IsCPF } from '../utils/cpf.validator';

export class CreateLeadPropriedadeDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  cultura: string;

  @IsNumber()
  hectares: number;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsIn([
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ])
  uf: string;

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

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

  @ValidateNested()
  @Type(() => CreateLeadPropriedadeDto)
  propriedade: CreateLeadPropriedadeDto;
}
