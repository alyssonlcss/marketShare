export interface PropriedadeRural {
  id: number;
  cultura: string;
  hectares: number;
  uf: string;
  cidade: string;
  geometria?: string | null;
  distribuidorId?: number | null;
  latitude: number;
  longitude: number;
  // O backend retorna a relação completa do lead (via leftJoinAndSelect)
  // e a coluna "leadId" não vem separada no JSON. Mantemos leadId opcional
  // para compatibilidade futura, mas usamos principalmente o objeto lead.
  leadId?: number | null;
  lead?: { id: number; nome?: string } | null;
}
