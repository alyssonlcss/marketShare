import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ApiService } from '../../core/services/api.service';
import { Lead } from '../../core/models/lead.model';
import { PropriedadeRural } from '../../core/models/propriedade-rural.model';
import { MapaPropriedadesComponent } from '../mapa-propriedades/mapa-propriedades.component';

type PriorityFilter = 'lt100' | 'gt100' | 'gt300';

type AtribuicaoFilter = 'atribuido' | 'nao_atribuido' | 'ambos';

type PriorityRecord = {
  lead: Lead;
  propriedade: PropriedadeRural;
};

type MunicipioRecord = {
  municipio: string;
  count: number;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, TableModule, SelectModule, MapaPropriedadesComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly leads = signal<Lead[]>([]);
  readonly propriedades = signal<PropriedadeRural[]>([]);

  readonly atribuicaoFilter = signal<AtribuicaoFilter>('ambos');
  readonly priorityFilter = signal<PriorityFilter>('gt100');

  // Paginação
  readonly municipioPaginaPage = signal(0);
  readonly priorityPage = signal(0);
  readonly itemsPerPage = 10;

  readonly filteredLeads = computed<Lead[]>(() => {
    const mode = this.atribuicaoFilter();
    if (mode === 'ambos') return this.leads();
    if (mode === 'atribuido') return this.leads().filter((l) => l.distribuidorId != null);
    return this.leads().filter((l) => l.distribuidorId == null);
  });

  readonly filteredPropriedades = computed<PropriedadeRural[]>(() => {
    const mode = this.atribuicaoFilter();
    if (mode === 'ambos') return this.propriedades();
    if (mode === 'atribuido') return this.propriedades().filter((p) => p.distribuidorId != null);
    return this.propriedades().filter((p) => p.distribuidorId == null);
  });

  readonly totalLeads = computed(() => this.filteredLeads().length);

  readonly leadsPorStatus = computed(() => {
    const counts: Record<string, number> = {};
    for (const lead of this.filteredLeads()) {
      counts[lead.status] = (counts[lead.status] || 0) + 1;
    }
    return counts;
  });

  readonly leadsPorMunicipioOrdenado = computed(() => {
    const counts: Record<string, number> = {};
    for (const prop of this.filteredPropriedades()) {
      const key = `${prop.cidade}/${prop.uf}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    // Ordenar por quantidade (decrescente) e depois por nome
    return Object.entries(counts)
      .map(([municipio, count]) => ({ municipio, count }))
      .sort((a, b) => b.count - a.count || a.municipio.localeCompare(b.municipio));
  });

  readonly municipiosPaginados = computed<MunicipioRecord[]>(() => {
    const page = this.municipioPaginaPage();
    const start = page * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.leadsPorMunicipioOrdenado().slice(start, end);
  });

  readonly totalMunicipios = computed(() => this.leadsPorMunicipioOrdenado().length);
  readonly totalMunicipioPages = computed(() => Math.ceil(this.totalMunicipios() / this.itemsPerPage));

  readonly priorityOptions: { label: string; value: PriorityFilter }[] = [
    { label: 'Menor que 100 ha', value: 'lt100' },
    { label: 'Maior que 100 ha', value: 'gt100' },
    { label: 'Maior que 300 ha', value: 'gt300' },
  ];

  readonly atribuicaoOptions: { label: string; value: AtribuicaoFilter }[] = [
    { label: 'Ambos', value: 'ambos' },
    { label: 'Atribuído', value: 'atribuido' },
    { label: 'Não atribuído', value: 'nao_atribuido' },
  ];

  private readonly priorityPredicates: Record<PriorityFilter, (hectares: number) => boolean> = {
    lt100: (hectares) => hectares < 100,
    gt100: (hectares) => hectares >= 100,
    gt300: (hectares) => hectares >= 300,
  };

  readonly priorityRecords = computed<PriorityRecord[]>(() => {
    const leadsById = new Map(this.filteredLeads().map((lead) => [lead.id, lead]));
    return this.filteredPropriedades()
      .map((prop) => {
        const propLeadId = prop.leadId ?? prop.lead?.id ?? null;
        if (propLeadId == null) {
          return null;
        }
        const lead = leadsById.get(propLeadId);
        return lead ? { lead, propriedade: prop } : null;
      })
      .filter((record): record is PriorityRecord => Boolean(record));
  });

  readonly filteredPriorities = computed<PriorityRecord[]>(() => {
    const predicate = this.priorityPredicates[this.priorityFilter()];
    return this.priorityRecords()
      .filter((record) => predicate(record.propriedade.hectares))
      .sort((a, b) => b.propriedade.hectares - a.propriedade.hectares);
  });

  readonly prioritiesPaginadas = computed<PriorityRecord[]>(() => {
    const page = this.priorityPage();
    const start = page * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPriorities().slice(start, end);
  });

  readonly totalPriorities = computed(() => this.filteredPriorities().length);
  readonly totalPriorityPages = computed(() => Math.ceil(this.totalPriorities() / this.itemsPerPage));

  readonly leadsPrioritariosCount = computed(() =>
    this.priorityRecords().filter((record) => record.propriedade.hectares >= 100).length,
  );

  ngOnInit(): void {
    // Carrega dados inicialmente com todos os acessíveis pelo backend
    this.api.getLeads().subscribe((data) => this.leads.set(data));
    this.api.getPropriedades().subscribe((data) => this.propriedades.set(data));
  }

  protected changeAtribuicaoFilter(value: string): void {
    const mode = value as AtribuicaoFilter;
    this.atribuicaoFilter.set(mode);
    // Reset paginação
    this.municipioPaginaPage.set(0);
    this.priorityPage.set(0);

    if (mode === 'atribuido') {
      const userJson = localStorage.getItem('marketshare_user');
      if (!userJson) return;
      try {
        const user = JSON.parse(userJson) as { distribuidor?: { id: number } | null };
        const distId = user.distribuidor?.id;
        if (typeof distId === 'number') {
          this.api.getLeads({ distribuidorId: distId }).subscribe((data) => this.leads.set(data));
          this.api
            .getPropriedades({ distribuidorId: distId })
            .subscribe((data) => this.propriedades.set(data));
        }
      } catch {
        // se der erro no parse, apenas mantém o filtro local
      }
    } else {
      this.api.getLeads().subscribe((data) => this.leads.set(data));
      this.api.getPropriedades().subscribe((data) => this.propriedades.set(data));
    }
  }

  protected changePriorityFilter(value: string): void {
    this.priorityFilter.set(value as PriorityFilter);
    this.priorityPage.set(0); // Reset paginação ao mudar filtro
  }

  protected loadMoreMunicipios(): void {
    if (this.municipioPaginaPage() < this.totalMunicipioPages() - 1) {
      this.municipioPaginaPage.set(this.municipioPaginaPage() + 1);
    }
  }

  protected loadMorePriorities(): void {
    if (this.priorityPage() < this.totalPriorityPages() - 1) {
      this.priorityPage.set(this.priorityPage() + 1);
    }
  }

  protected onMunicipiosScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const scrollPercentage = (element.scrollTop + element.clientHeight) / element.scrollHeight;
    // Carrega mais quando scrollar até 80% do final
    if (scrollPercentage > 0.8) {
      this.loadMoreMunicipios();
    }
  }

  protected onPriorityScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const scrollPercentage = (element.scrollTop + element.clientHeight) / element.scrollHeight;
    // Carrega mais quando scrollar até 80% do final
    if (scrollPercentage > 0.8) {
      this.loadMorePriorities();
    }
  }

  protected readonly Math = Math;
}
