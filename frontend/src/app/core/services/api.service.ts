import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lead } from '../models/lead.model';
import { PropriedadeRural } from '../models/propriedade-rural.model';
import { AuthService } from './auth.service';

const API_BASE_URL = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  private readonly auth = inject(AuthService);

  // Leads
  getLeads(params?: { distribuidorId?: number }): Observable<Lead[]> {
    let httpParams = new HttpParams();
    if (params && typeof params.distribuidorId === 'number') {
      httpParams = httpParams.set('distribuidorId', String(params.distribuidorId));
    }
    return this.http.get<Lead[]>(`${API_BASE_URL}/lead`, { params: httpParams });
  }

  createLead(payload: Partial<Lead>): Observable<Lead> {
    return this.http.post<Lead>(`${API_BASE_URL}/lead`, payload);
  }

  updateLead(id: number, payload: Partial<Lead>): Observable<Lead> {
    return this.http.patch<Lead>(`${API_BASE_URL}/lead/${id}`, payload);
  }

  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/lead/${id}`);
  }

  // Propriedades Rurais
  getPropriedades(params?: { distribuidorId?: number | null }): Observable<PropriedadeRural[]> {
    let httpParams = new HttpParams();
    if (params && typeof params.distribuidorId === 'number') {
      httpParams = httpParams.set('distribuidorId', String(params.distribuidorId));
    }
    return this.http.get<PropriedadeRural[]>(`${API_BASE_URL}/propriedade-rural`, { params: httpParams });
  }

  createPropriedade(payload: Partial<PropriedadeRural>): Observable<PropriedadeRural> {
    return this.http.post<PropriedadeRural>(`${API_BASE_URL}/propriedade-rural`, payload);
  }

  updatePropriedade(id: number, payload: Partial<PropriedadeRural>): Observable<PropriedadeRural> {
    return this.http.patch<PropriedadeRural>(`${API_BASE_URL}/propriedade-rural/${id}`, payload);
  }

  deletePropriedade(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/propriedade-rural/${id}`);
  }

  // Localização (IBGE)
  getEstados(): Observable<{ id: number; sigla: string; nome: string }[]> {
    return this.http.get<{ id: number; sigla: string; nome: string }[]>(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome',
    );
  }

  getCidadesPorUf(uf: string): Observable<{ id: number; nome: string }[]> {
    return this.http.get<{ id: number; nome: string }[]>(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
    );
  }
}
