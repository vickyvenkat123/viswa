import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ExportDialogComponent } from './export-dialog/export-dialog.component';

const routes: Routes = [
  { path: 'export', component: ExportDialogComponent },
  { path: '', redirectTo: 'customer', pathMatch: 'full' },
  {
    path: 'customer',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./customer/customer.module').then(
        (module) => module.CustomerModule
      ),
  },
  {
    path: 'item',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./item/items.module').then(
        (module) => module.MasterItemsModule
      ),
  },
  {
    path: 'salesman',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./salesman/salesman.module').then(
        (module) => module.SalesmanModule
      ),
  },
  {
    path: 'merchandiser',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./salesman/salesman.module').then(
        (module) => module.SalesmanModule
      ),
  },
  {
    path: 'journey-plan',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./journey-plan/journey-plan.module').then(
        (module) => module.JourneyPlanModule
      ),
  },
  {
    path: 'vendor',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./vendor/vendor.module').then(
        (module) => module.VendorModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule { }