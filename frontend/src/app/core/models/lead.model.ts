import { PropriedadeRural } from './propriedade-rural.model';

export type LeadStatus = 'novo' | 'contatoInicial' | 'negociando' | 'convertido' | 'perdido';

export interface Lead {
  id: number;
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  status: LeadStatus;
  distribuidorId?: number | null;
  comentario?: string;
  propriedadesRurais?: PropriedadeRural[];
}
