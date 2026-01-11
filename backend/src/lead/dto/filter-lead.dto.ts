import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto } from './create-lead.dto';

// Todos os campos opcionais, usados como filtros de query
export class FilterLeadDto extends PartialType(CreateLeadDto) {}
