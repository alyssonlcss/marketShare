import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto } from './create-lead.dto';

// Não permite atualizar cpf: removemos cpf do DTO de update
export class UpdateLeadDto extends PartialType(OmitType(CreateLeadDto, ['cpf'] as const)) {}
