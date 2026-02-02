import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UnidadeMedida } from '../entity/produto.entity';

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoria?: string[];

  @IsEnum(UnidadeMedida)
  unidadeMedida: UnidadeMedida;

  @IsNumber()
  custoUnidade: number;

  @IsNumber()
  distribuidorId: number;
}
