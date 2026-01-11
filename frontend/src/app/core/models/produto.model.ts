export type UnidadeMedida =
  | 'tonelada'
  | 'quilo'
  | 'litro'
  | 'quilolitro'
  | 'metro'
  | 'quilometro';

export interface Produto {
  id: number;
  nome: string;
  categoria?: string[] | null;
  custoUnidade: number;
  unidadeMedida: UnidadeMedida;
  distribuidorId?: number | null;
  distribuidor?: { id: number; nome?: string } | null;
}
