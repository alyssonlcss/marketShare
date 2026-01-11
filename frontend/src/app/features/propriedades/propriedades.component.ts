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

  readonly propriedades = signal<PropriedadeRural[]>([]);
  readonly atribuicaoFilter = this.filterService.atribuicaoFilter;

  dialogVisible = false;
  editing: PropriedadeRural | null = null;

  formModel: Partial<PropriedadeRural> = {
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
  }

  load(): void {
    const mode = this.filterService.getAtribuicaoFilter();
    
    // Carrega leads com o filtro apropriado e depois extrai as propriedades
    if (mode === 'atribuido') {
      const user = this.auth.getCurrentUser();
      const distribuidorId = user?.distribuidor?.id;
      if (distribuidorId) {
        this.api.getLeads({ distribuidorId }).subscribe((leads) => {
          const props: PropriedadeRural[] = [];
          for (const lead of leads) {
            if (lead.propriedadesRurais?.length) {
              props.push(...lead.propriedadesRurais);
            }
          }
          this.propriedades.set(props);
        });
      }
    } else {
      // Não atribuído: carrega leads sem filtro de distribuidor
      this.api.getLeads().subscribe((leads) => {
        const props: PropriedadeRural[] = [];
        for (const lead of leads) {
          if (lead.propriedadesRurais?.length) {
            props.push(...lead.propriedadesRurais);
          }
        }
        this.propriedades.set(props);
      });
    }
  }

  openNew(): void {
    this.editing = null;
    this.formModel = {
      cultura: '',
      hectares: 0,
      uf: '',
      cidade: '',
      latitude: 0,
      longitude: 0,
    };
    this.dialogVisible = true;
  }

  edit(prop: PropriedadeRural): void {
    this.editing = prop;
    this.formModel = { ...prop };
    this.dialogVisible = true;
  }

  save(): void {
    if (this.editing) {
      this.api.updatePropriedade(this.editing.id, this.formModel).subscribe(() => {
        this.dialogVisible = false;
        this.load();
      });
    } else {
      this.api.createPropriedade(this.formModel).subscribe(() => {
        this.dialogVisible = false;
        this.load();
      });
    }
  }

  delete(prop: PropriedadeRural): void {
    if (!confirm(`Deseja remover a propriedade "${prop.cultura}"?`)) return;
    this.api.deletePropriedade(prop.id).subscribe(() => this.load());
  }
}
