import { PartialType } from '@nestjs/mapped-types';
import { CreatePropriedadeRuralDto } from './create-propriedade-rural.dto';

export class UpdatePropriedadeRuralDto extends PartialType(CreatePropriedadeRuralDto) {}
