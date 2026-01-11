import { PartialType } from '@nestjs/mapped-types';
import { CreatePropriedadeRuralDto } from './create-propriedade-rural.dto';

// Todos os campos opcionais, usados como filtros de query
export class FilterPropriedadeRuralDto extends PartialType(CreatePropriedadeRuralDto) {}
