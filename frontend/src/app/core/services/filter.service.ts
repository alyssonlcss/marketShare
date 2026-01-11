import { Injectable, signal } from '@angular/core';

export type AtribuicaoFilter = 'atribuido' | 'nao_atribuido';

@Injectable({ providedIn: 'root' })
export class FilterService {
  readonly atribuicaoFilter = signal<AtribuicaoFilter>('nao_atribuido');

  setAtribuicaoFilter(value: AtribuicaoFilter): void {
    this.atribuicaoFilter.set(value);
  }

  getAtribuicaoFilter(): AtribuicaoFilter {
    return this.atribuicaoFilter();
  }
}
