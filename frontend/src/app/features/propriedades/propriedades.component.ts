import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ApiService } from '../../core/services/api.service';
import { FilterService } from '../../core/services/filter.service';
import { AuthService } from '../../core/services/auth.service';
import { PropriedadeRural } from '../../core/models/propriedade-rural.model';
import { Lead } from '../../core/models/lead.model';

@Component({
  selector: 'app-propriedades',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DialogModule, InputTextModule, SelectModule],
  templateUrl: './propriedades.component.html',
  styleUrl: './propriedades.component.scss',
})
export class PropriedadesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly filterService = inject(FilterService);
  private readonly auth = inject(AuthService);

  readonly leads = signal<Lead[]>([]);
  readonly propriedades = signal<PropriedadeRural[]>([]);
  readonly atribuicaoFilter = this.filterService.atribuicaoFilter;

  dialogVisible = false;
  editing: PropriedadeRural | null = null;

  // Diálogo de erro genérico para chamadas de API
  errorDialogVisible = false;
  errorMessage = '';

  // Gaveta de detalhes do lead
  selectedPropriedade: PropriedadeRural | null = null;
  selectedLead: Lead | null = null;

  // Dropdowns UF/cidade (formulário de criação/edição)
  ufList: { id: number; sigla: string; nome: string }[] = [];
  cidadeFormOptions: { id: number; nome: string }[] = [];

  formModel: Partial<PropriedadeRural> = {
    nome: '',
    cultura: '',
    hectares: 0,
    uf: '',
    cidade: '',
    latitude: 0,
    longitude: 0,
  };

  get ufOptions(): string[] {
    const set = new Set(this.propriedades().map((p) => p.uf).filter((v): v is string => !!v));
    return Array.from(set).sort();
  }

  get cidadeOptions(): string[] {
    const set = new Set(this.propriedades().map((p) => p.cidade).filter((v): v is string => !!v));
    return Array.from(set).sort();
  }

  ngOnInit(): void {
    this.load();
    this.loadUfs();
  }

  load(): void {
    const mode = this.filterService.getAtribuicaoFilter();
    
    // Carrega leads com o filtro apropriado e depois extrai as propriedades
    if (mode === 'atribuido') {
      const user = this.auth.getCurrentUser();
      const distribuidorId = user?.distribuidor?.id;
      if (distribuidorId) {
        this.api.getLeads({ distribuidorId }).subscribe({
          next: (leads) => {
            this.leads.set(leads);
            const props: PropriedadeRural[] = [];
            for (const lead of leads) {
              if (lead.propriedadesRurais?.length) {
                props.push(...lead.propriedadesRurais);
              }
            }
            this.propriedades.set(props);
          },
          error: (err) => this.handleError(err, 'Não foi possível carregar as propriedades atribuídas.'),
        });
      }
    } else {
      // Não atribuído: carrega leads sem filtro de distribuidor
      this.api.getLeads().subscribe({
        next: (leads) => {
          this.leads.set(leads);
          const props: PropriedadeRural[] = [];
          for (const lead of leads) {
            if (lead.propriedadesRurais?.length) {
              props.push(...lead.propriedadesRurais);
            }
          }
          this.propriedades.set(props);
        },
        error: (err) => this.handleError(err, 'Não foi possível carregar as propriedades.'),
      });
    }
  }

  openNewForLead(): void {
    if (!this.selectedLead) {
      return;
    }

    this.editing = null;
    this.formModel = {
      nome: '',
      cultura: '',
      hectares: 0,
      uf: this.selectedPropriedade?.uf || '',
      cidade: '',
      latitude: 0,
      longitude: 0,
      leadId: this.selectedLead.id,
    };

    if (this.formModel.uf) {
      this.onUfChange(this.formModel.uf);
    } else {
      this.cidadeFormOptions = [];
    }

    this.dialogVisible = true;
  }

  edit(prop: PropriedadeRural): void {
    this.editing = prop;
    this.formModel = { ...prop };

    if (this.formModel.uf) {
      this.onUfChange(this.formModel.uf);
    }

    this.dialogVisible = true;
  }

  save(): void {
    if (this.editing) {
      this.api.updatePropriedade(this.editing.id, this.formModel).subscribe({
        next: () => {
          this.dialogVisible = false;
          this.load();
        },
        error: (err) => this.handleError(err, 'Não foi possível atualizar a propriedade.'),
      });
    } else {
      if (!this.formModel.leadId) {
        alert('Selecione um lead para criar uma nova propriedade.');
        return;
      }
      this.api.createPropriedade(this.formModel).subscribe({
        next: () => {
          this.dialogVisible = false;
          this.load();
        },
        error: (err) => this.handleError(err, 'Não foi possível criar a propriedade.'),
      });
    }
  }

  delete(prop: PropriedadeRural): void {
    if (!confirm(`Deseja remover a propriedade "${prop.cultura}"?`)) return;
    this.api.deletePropriedade(prop.id).subscribe({
      next: () => this.load(),
      error: (err) => this.handleError(err, 'Não foi possível remover a propriedade.'),
    });
  }

  onRowClick(prop: PropriedadeRural): void {
    const lead = this.leads().find((l) => l.propriedadesRurais?.some((p) => p.id === prop.id));
    this.selectedPropriedade = prop;
    this.selectedLead = lead || null;
  }

  closeDrawer(): void {
    this.selectedPropriedade = null;
    this.selectedLead = null;
  }

  private loadUfs(): void {
    this.api.getEstados().subscribe({
      next: (ufs) => {
        this.ufList = ufs.sort((a, b) => a.nome.localeCompare(b.nome));
      },
      error: (err) => this.handleError(err, 'Não foi possível carregar a lista de estados.'),
    });
  }

  onUfChange(uf: string): void {
    this.formModel.cidade = '';
    if (!uf) {
      this.cidadeFormOptions = [];
      return;
    }

    this.api.getCidadesPorUf(uf).subscribe({
      next: (cidades) => {
        this.cidadeFormOptions = cidades.sort((a, b) => a.nome.localeCompare(b.nome));
      },
      error: (err) => this.handleError(err, 'Não foi possível carregar a lista de cidades.'),
    });
  }

  private handleError(error: any, fallbackMessage: string): void {
    // Você pode inspecionar error.error.message, error.message, etc.
    console.error('Erro na API de propriedades:', error);
    const backendMessage =
      (error && error.error && (error.error.message || error.error.error || error.error)) || error.message;
    this.errorMessage = backendMessage || fallbackMessage;
    this.errorDialogVisible = true;
  }
}
