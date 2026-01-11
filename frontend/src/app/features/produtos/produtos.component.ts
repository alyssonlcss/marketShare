import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { FilterService } from '../../core/services/filter.service';
import { Lead } from '../../core/models/lead.model';
import { Produto, UnidadeMedida } from '../../core/models/produto.model';
import { PropriedadeRural } from '../../core/models/propriedade-rural.model';

interface PropriedadeMatch {
  propriedade: PropriedadeRural;
  produtos: Produto[];
}

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DialogModule, InputTextModule, SelectModule],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.scss',
})
export class ProdutosComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly filterService = inject(FilterService);

  readonly produtos = signal<Produto[]>([]);
  readonly leads = signal<Lead[]>([]);
  readonly propriedades = signal<PropriedadeRural[]>([]);
  readonly atribuicaoFilter = this.filterService.atribuicaoFilter;

  dialogVisible = false;
  editing: Produto | null = null;

  errorDialogVisible = false;
  errorMessage = '';

  // Campo de edição de categorias como texto separado por vírgula
  categoriaTexto = '';

  formModel: Partial<Produto> = {
    nome: '',
    custoUnidade: 0,
    unidadeMedida: 'tonelada',
  };

  readonly unidadeMedidaOptions: { label: string; value: UnidadeMedida }[] = [
    { label: 'Tonelada', value: 'tonelada' },
    { label: 'Quilo', value: 'quilo' },
    { label: 'Litro', value: 'litro' },
    { label: 'Quilolitro', value: 'quilolitro' },
    { label: 'Metro', value: 'metro' },
    { label: 'Quilômetro', value: 'quilometro' },
  ];

  readonly matchesByPropriedade = computed<PropriedadeMatch[]>(() => {
    const produtos = this.produtos();
    const propriedades = this.propriedades();

    const result: PropriedadeMatch[] = [];

    for (const prop of propriedades) {
      const matched: Produto[] = [];
      const culturaNorm = (prop.cultura || '').toLocaleLowerCase().trim();
      if (!culturaNorm) {
        continue;
      }

      for (const produto of produtos) {
        if (!produto.categoria || produto.categoria.length === 0) continue;
        const hasMatch = produto.categoria.some((cat) => {
          const catNorm = (cat || '').toLocaleLowerCase().trim();
          if (!catNorm) return false;
          return culturaNorm === catNorm || culturaNorm.includes(catNorm) || catNorm.includes(culturaNorm);
        });
        if (hasMatch) {
          matched.push(produto);
        }
      }

      if (matched.length) {
        result.push({ propriedade: prop, produtos: matched });
      }
    }

    return result;
  });

  ngOnInit(): void {
    this.loadDados();
  }

  private loadDados(): void {
    this.api.getProdutos().subscribe({
      next: (produtos) => {
        this.produtos.set(produtos);
      },
      error: (err) => this.handleError(err, 'Não foi possível carregar os produtos.'),
    });

    const mode = this.filterService.getAtribuicaoFilter();

    // Aplica EXATAMENTE o mesmo padrão da tela de /propriedades:
    // - Se "atribuído": chama getLeads({ distribuidorId }) e extrai propriedades dos leads retornados.
    // - Se "não atribuído": chama getLeads() sem distribuidorId e extrai apenas propriedades não atribuídas,
    //   pois o backend já filtra por distribuidorId nas propriedades de cada lead.
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
          error: (err) => this.handleError(err, 'Não foi possível carregar as propriedades atribuídas para matching.'),
        });
      }
    } else {
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
        error: (err) => this.handleError(err, 'Não foi possível carregar as propriedades não atribuídas para matching.'),
      });
    }
  }

  openNew(): void {
    this.editing = null;
    this.formModel = {
      nome: '',
      custoUnidade: 0,
      unidadeMedida: 'tonelada',
      categoria: [],
    };
    this.categoriaTexto = '';
    this.dialogVisible = true;
  }

  edit(produto: Produto): void {
    this.editing = produto;
    this.formModel = {
      id: produto.id,
      nome: produto.nome,
      custoUnidade: produto.custoUnidade,
      unidadeMedida: produto.unidadeMedida,
      categoria: produto.categoria ?? [],
    };
    this.categoriaTexto = (produto.categoria ?? []).join(', ');
    this.dialogVisible = true;
  }

  save(): void {
    const categoriaArray = this.categoriaTexto
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (this.editing) {
      const payload: Partial<Produto> = {
        nome: this.formModel.nome,
        custoUnidade: this.formModel.custoUnidade,
        unidadeMedida: this.formModel.unidadeMedida as UnidadeMedida,
        categoria: categoriaArray,
      };

      this.api.updateProduto(this.editing.id, payload).subscribe({
        next: () => {
          this.dialogVisible = false;
          this.loadDados();
        },
        error: (err) => this.handleError(err, 'Não foi possível atualizar o produto.'),
      });
    } else {
      const user = this.auth.getCurrentUser();
      const distribuidorId = user?.distribuidor?.id;

      if (!distribuidorId) {
        this.handleError(null, 'Usuário não possui distribuidor associado para criar produtos.');
        return;
      }

      const payload: Partial<Produto> & { distribuidorId: number } = {
        nome: this.formModel.nome!,
        custoUnidade: this.formModel.custoUnidade!,
        unidadeMedida: this.formModel.unidadeMedida as UnidadeMedida,
        categoria: categoriaArray,
        distribuidorId,
      };

      this.api.createProduto(payload).subscribe({
        next: () => {
          this.dialogVisible = false;
          this.loadDados();
        },
        error: (err) => this.handleError(err, 'Não foi possível criar o produto.'),
      });
    }
  }

  delete(produto: Produto): void {
    if (!confirm(`Deseja remover o produto "${produto.nome}"?`)) return;
    this.api.deleteProduto(produto.id).subscribe({
      next: () => this.loadDados(),
      error: (err) => this.handleError(err, 'Não foi possível remover o produto.'),
    });
  }

  private handleError(error: any, fallbackMessage: string): void {
    console.error('Erro na tela de produtos:', error);
    const backendMessage =
      (error && error.error && (error.error.message || error.error.error || error.error)) || error?.message;
    this.errorMessage = backendMessage || fallbackMessage;
    this.errorDialogVisible = true;
  }
}
