import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../../core/services/api.service';
import { Lead } from '../../core/models/lead.model';
import { PropriedadeRural } from '../../core/models/propriedade-rural.model';

class ApiServiceMock {
  getLeads() {
    const leads: Lead[] = [
      { id: 1, nome: 'Lead 1', cpf: '00000000000', status: 'novo' },
      { id: 2, nome: 'Lead 2', cpf: '11111111111', status: 'negociando' },
    ];
    return of(leads);
  }

  getPropriedades() {
    const props: PropriedadeRural[] = [
      {
        id: 1,
        nome: 'Fazenda 1',
        cultura: 'Soja',
        hectares: 150,
        uf: 'GO',
        cidade: 'Rio Verde',
        latitude: -17,
        longitude: -50,
        leadId: 1,
      },
      {
        id: 2,
        nome: 'Fazenda 2',
        cultura: 'Milho',
        hectares: 80,
        uf: 'GO',
        cidade: 'Rio Verde',
        latitude: -17.1,
        longitude: -50.1,
        leadId: 2,
      },
    ];
    return of(props);
  }
}

describe('DashboardComponent', () => {
  it('should compute total leads and prioritarios correctly', () => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: ApiService, useClass: ApiServiceMock }],
    });

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.totalLeads()).toBe(2);
    expect(component.leadsPrioritariosCount()).toBe(1);
    expect(component.filteredPriorities().length).toBe(1);

    component.priorityFilter.set('lt100');
    fixture.detectChanges();
    expect(component.filteredPriorities().length).toBe(1);

    component.priorityFilter.set('gt300');
    fixture.detectChanges();
    expect(component.filteredPriorities().length).toBe(0);
  });
});
