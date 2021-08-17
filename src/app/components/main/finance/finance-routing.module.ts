import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: 'cashier-reciept',
    loadChildren: () =>
      import('./cashier-receipt/cashier-reciept.module')
        .then((module) => module.CashierReceiptModule
        ),
  },
  {
    path: 'pdc',
    loadChildren: () =>
      import('./pdc/pdc.module')
        .then((module) => module.PdcModule),
  },
  {
    path: 'todo',
    loadChildren: () =>
      import('./todo/todo.module')
        .then((module) => module.TodoModule)
  },
  {
    path: 'daily_field_activity',
    loadChildren: () =>
      import('./daily-field-activity/daily-field-activity.module')
        .then((module) => module.DailyFieldActivityModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceRoutingModule { }