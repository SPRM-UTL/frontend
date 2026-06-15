import { Routes } from '@angular/router';
import { Login }        from './login/login';
import { Register }     from './register/register';
import { Dashboard }    from './dashboard/dashboard';
import { Inicio }       from './dashboard/inicio/inicio';
import { Cuenta }       from './cuenta/cuenta';
import { Dispositivos } from './dispositivos/dispositivos';
import { Gestos }       from './gestos/gestos';
import { Historial }    from './historial/historial';
import { Control }      from './control/control';
import { Ajustes }      from './ajustes/ajustes';

export const routes: Routes = [
  { path: '',         component: Login },
  { path: 'login',    component: Login },
  { path: 'register', component: Register },

  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      { path: '',             redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio',       component: Inicio },
      { path: 'dispositivos', component: Dispositivos },
      { path: 'cuenta',       component: Cuenta },
      { path: 'gestos',       component: Gestos },
      { path: 'historial',    component: Historial },
      { path: 'control',      component: Control },
      { path: 'ajustes',      component: Ajustes },
    ]
  },
];
