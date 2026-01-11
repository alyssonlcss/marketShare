import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoDto } from './create-produto.dto';

// Todos os campos opcionais, usados como filtros de query
export class FilterProdutoDto extends PartialType(CreateProdutoDto) {}
