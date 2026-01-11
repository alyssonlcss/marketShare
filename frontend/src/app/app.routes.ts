import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LeadsComponent } from './features/leads/leads.component';
import { PropriedadesComponent } from './features/propriedades/propriedades.component';
import { ProdutosComponent } from './features/produtos/produtos.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: '', component: DashboardComponent, canActivate: [authGuard] },
	{ path: 'leads', component: LeadsComponent, canActivate: [authGuard] },
	{ path: 'propriedades', component: PropriedadesComponent, canActivate: [authGuard] },
	{ path: 'produtos', component: ProdutosComponent, canActivate: [authGuard] },
	{ path: '**', redirectTo: '' },
];
