import { RebatePageComponent } from './rebate-page/rebate-page.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RebateFormComponent } from './rebate-form/rebate-form.component';


const routes: Routes = [
  {
    path: '',
    component: RebatePageComponent
  },
  {
    path: 'add',
    component: RebateFormComponent
  },
  {
    path: 'edit/:uuid',
    component: RebateFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RebateRoutingModule { }
