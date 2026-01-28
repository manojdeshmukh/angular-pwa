import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/form/form.component').then(m => m.FormComponent) },
  { path: 'submissions', loadComponent: () => import('./components/submissions-list/submissions-list.component').then(m => m.SubmissionsListComponent) },
  { path: '**', redirectTo: '' }
];
