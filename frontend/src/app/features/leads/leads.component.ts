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

  formModel: Partial<Lead> = {
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    status: 'novo',
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
    };
    this.dialogVisible = true;
  }

  editLead(lead: Lead): void {
    this.editingLead = lead;
    this.formModel = { ...lead };
    this.dialogVisible = true;
  }

  save(): void {
    if (this.editingLead) {
      this.api.updateLead(this.editingLead.id, this.formModel).subscribe(() => {
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

  deleteLead(lead: Lead): void {
    if (!confirm(`Deseja remover o lead "${lead.nome}"?`)) return;
    this.api.deleteLead(lead.id).subscribe(() => this.loadLeads());
  }
}
