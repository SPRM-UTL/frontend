import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Dashboard } from './dashboard/dashboard';
import { Inicio } from './dashboard/inicio/inicio';
import { Ajustes } from './ajustes/ajustes';
import { Cuenta } from './cuenta/cuenta';
import { Dispositivos } from './dispositivos/dispositivos';
import { Gestos } from './gestos/gestos';
import { Historial } from './historial/historial';
import { Control } from './control/control';
import { authChildGuard, authGuard } from './core/auth.guard';
import { SesionExpirada } from './sesion-expirada/sesion-expirada';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'register', component: Register },
  { path: 'sesion-expirada', component: SesionExpirada },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: Inicio },
      { path: 'dispositivos', component: Dispositivos },
      { path: 'ajustes', component: Ajustes },
      { path: 'cuenta', component: Cuenta },
      { path: 'gestos', component: Gestos },
      { path: 'historial', component: Historial },
      { path: 'control', component: Control },
    ]
  },
];
