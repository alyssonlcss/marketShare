import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProdutosComponent } from './produtos.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { FilterService, AtribuicaoFilter } from '../../core/services/filter.service';
import { Produto } from '../../core/models/produto.model';
import { PropriedadeRural } from '../../core/models/propriedade-rural.model';

class ApiServiceMock {
  getProdutos() {
    return of<Produto[]>([]);
  }

  getLeads() {
    return of([]);
  }
}

class AuthServiceMock {
  getCurrentUser() {
    return null;
  }
}

class FilterServiceMock {
  // Simula o signal atribuicaoFilter usado no componente
  atribuicaoFilter = (() => 'nao_atribuido') as unknown as () => AtribuicaoFilter;

  getAtribuicaoFilter(): AtribuicaoFilter {
    return 'nao_atribuido';
  }
}

describe('ProdutosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutosComponent],
      providers: [
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: FilterService, useClass: FilterServiceMock },
      ],
    }).compileComponents();
  });

  it('should create and compute matches by propriedade', () => {
    const fixture = TestBed.createComponent(ProdutosComponent);
    const component = fixture.componentInstance;

    const produtos: Produto[] = [
      {
        id: 1,
        nome: 'Herbicida Soja',
        custoUnidade: 100,
        unidadeMedida: 'litro',
        categoria: ['soja'],
      },
      {
        id: 2,
        nome: 'Fertilizante Milho',
        custoUnidade: 200,
        unidadeMedida: 'quilo',
        categoria: ['milho'],
      },
    ];

    const propriedades: PropriedadeRural[] = [
      {
        id: 10,
        nome: 'Fazenda Soja',
        cultura: 'soja',
        hectares: 100,
        uf: 'MG',
        cidade: 'Uberlandia',
        latitude: -18.9,
        longitude: -48.2,
        leadId: 1,
      },
      {
        id: 11,
        nome: 'Sitio Misto',
        cultura: 'soja e milho',
        hectares: 50,
        uf: 'MG',
        cidade: 'Uberaba',
        latitude: -19.7,
        longitude: -47.9,
        leadId: 2,
      },
      {
        id: 12,
        nome: 'Chacara Sem Cultura',
        cultura: '',
        hectares: 10,
        uf: 'MG',
        cidade: 'Patos de Minas',
        latitude: -18.5,
        longitude: -46.5,
        leadId: 3,
      },
    ];

    component.produtos.set(produtos);
    component.propriedades.set(propriedades);

    const matches = component.matchesByPropriedade();

    expect(matches.length).toBe(2);
    expect(matches[0].propriedade.nome).toBe('Fazenda Soja');
    expect(matches[0].produtos.map((p) => p.nome)).toContain('Herbicida Soja');

    expect(matches[1].propriedade.nome).toBe('Sitio Misto');
    expect(matches[1].produtos.map((p) => p.nome)).toContain('Herbicida Soja');
    expect(matches[1].produtos.map((p) => p.nome)).toContain('Fertilizante Milho');
  });
});
