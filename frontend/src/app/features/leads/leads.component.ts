import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../core/services/api.service';
import { FilterService } from '../../core/services/filter.service';
import { AuthService } from '../../core/services/auth.service';
import { Lead, LeadStatus } from '../../core/models/lead.model';
import { Distribuidor } from '../../core/models/distribuidor.model';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DialogModule, SelectModule, InputTextModule],
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.scss',
})
export class LeadsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly filterService = inject(FilterService);
  private readonly auth = inject(AuthService);

  readonly leads = signal<Lead[]>([]);
  readonly atribuicaoFilter = this.filterService.atribuicaoFilter;

  dialogVisible = false;
  editingLead: Lead | null = null;

  // Dropdowns UF/cidade para a propriedade criada junto com o lead
  ufList: { id: number; sigla: string; nome: string }[] = [];
  cidadeFormOptions: { id: number; nome: string }[] = [];

  distribuidores: Distribuidor[] = [];

  formModel: any = {
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    status: 'novo',
    comentario: '',
    propriedade: {
      nome: '',
      cultura: '',
      hectares: 0,
      uf: '',
      cidade: '',
      latitude: 0,
      longitude: 0,
    },
  };

  readonly statusOptions: { label: string; value: LeadStatus }[] = [
    { label: 'Novo', value: 'novo' },
    { label: 'Contato Inicial', value: 'contatoInicial' },
    { label: 'Negociando', value: 'negociando' },
    { label: 'Convertido', value: 'convertido' },
    { label: 'Perdido', value: 'perdido' },
  ];

  ngOnInit(): void {
    this.loadLeads();
    this.loadUfs();
    this.initDistribuidoresFromUser();
  }

  loadLeads(): void {
    const mode = this.filterService.getAtribuicaoFilter();
    if (mode === 'atribuido') {
      const user = this.auth.getCurrentUser();
      const distribuidorId = user?.distribuidor?.id;
      if (distribuidorId) {
        this.api.getLeads({ distribuidorId }).subscribe((data) => this.leads.set(data));
      }
    } else {
      // Não atribuído: não envia distribuidorId
      this.api.getLeads().subscribe((data) => this.leads.set(data));
    }
  }

  openNew(): void {
    this.editingLead = null;
    this.formModel = {
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      status: 'novo',
      comentario: '',
      distribuidorId: undefined,
      propriedade: {
        nome: '',
        cultura: '',
        hectares: 0,
        uf: '',
        cidade: '',
        latitude: 0,
        longitude: 0,
      },
    };
    this.cidadeFormOptions = [];
    this.dialogVisible = true;
  }

  editLead(lead: Lead): void {
    this.editingLead = lead;

    const firstProp = lead.propriedadesRurais && lead.propriedadesRurais.length > 0 ? lead.propriedadesRurais[0] : undefined;

    this.formModel = {
      nome: lead.nome,
      cpf: '',
      email: lead.email || '',
      telefone: lead.telefone || '',
      status: lead.status,
      comentario: lead.comentario || '',
      distribuidorId: lead.distribuidorId ?? undefined,
      propriedade: {
        nome: firstProp?.nome || '',
        cultura: firstProp?.cultura || '',
        hectares: firstProp?.hectares ?? 0,
        uf: firstProp?.uf || '',
        cidade: firstProp?.cidade || '',
        latitude: firstProp?.latitude ?? 0,
        longitude: firstProp?.longitude ?? 0,
      },
    };

    this.cidadeFormOptions = [];
    if (this.formModel.propriedade.uf) {
      this.onPropriedadeUfChange(this.formModel.propriedade.uf, true);
    }

    this.dialogVisible = true;
  }

  save(): void {
    if (this.editingLead) {
      const payload: any = {
        nome: this.formModel.nome,
        status: this.formModel.status,
        comentario: this.formModel.comentario,
        email: this.formModel.email,
        telefone: this.formModel.telefone,
      };

      if (typeof this.formModel.distribuidorId === 'number') {
        payload.distribuidorId = this.formModel.distribuidorId;
      }

      if (this.formModel.propriedade) {
        payload.propriedade = {
          nome: this.formModel.propriedade.nome,
          cultura: this.formModel.propriedade.cultura,
          hectares: this.formModel.propriedade.hectares,
          uf: this.formModel.propriedade.uf,
          cidade: this.formModel.propriedade.cidade,
          latitude: this.formModel.propriedade.latitude,
          longitude: this.formModel.propriedade.longitude,
        };
      }

      this.api.updateLead(this.editingLead.id, payload).subscribe(() => {
        this.dialogVisible = false;
        this.loadLeads();
      });
    } else {
      this.api.createLead(this.formModel).subscribe(() => {
        this.dialogVisible = false;
        this.loadLeads();
      });
    }
  }

  onCpfBlur(): void {
    const raw = this.formModel.cpf || '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 11) {
      this.formModel.cpf = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      this.formModel.cpf = raw;
    }
  }

  onTelefoneBlur(): void {
    const raw = this.formModel.telefone || '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) {
      // Formato fixo: (99) 9999-9999
      this.formModel.telefone = digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (digits.length === 11) {
      // Formato celular: (99) 99999-9999
      this.formModel.telefone = digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else {
      this.formModel.telefone = raw;
    }
  }

  deleteLead(lead: Lead): void {
    if (!confirm(`Deseja remover o lead "${lead.nome}"?`)) return;
    this.api.deleteLead(lead.id).subscribe(() => this.loadLeads());
  }

  private loadUfs(): void {
    this.api.getEstados().subscribe({
      next: (ufs) => {
        this.ufList = ufs.sort((a, b) => a.nome.localeCompare(b.nome));
      },
      error: (err) => {
        console.error('Erro ao carregar estados para lead:', err);
      },
    });
  }

  private initDistribuidoresFromUser(): void {
    const user = this.auth.getCurrentUser();
    if (user?.distribuidor) {
      this.distribuidores = [
        {
          id: user.distribuidor.id,
          nome: user.distribuidor.nome,
          cnpj: '',
          geografia: '',
          email: '',
        },
      ];
    } else {
      this.distribuidores = [];
    }
  }

  onPropriedadeUfChange(uf: string, preserveCidade = false): void {
    if (!preserveCidade) {
      this.formModel.propriedade.cidade = '';
    }
    if (!uf) {
      this.cidadeFormOptions = [];
      return;
    }

    this.api.getCidadesPorUf(uf).subscribe({
      next: (cidades) => {
        this.cidadeFormOptions = cidades.sort((a, b) => a.nome.localeCompare(b.nome));
      },
      error: (err) => {
        console.error('Erro ao carregar cidades para lead:', err);
      },
    });
  }
}
