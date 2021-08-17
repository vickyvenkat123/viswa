import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DailyFieldMasterAddComponent } from './daily-field-master-add/daily-field-master-add.component';
import { DailyFieldMasterDetailComponent } from './daily-field-master-detail/daily-field-master-detail.component';
import { DailyFieldMasterComponent } from './daily-field-master/daily-field-master.component';


const routes: Routes = [
  { path: '', component: DailyFieldMasterComponent },
  { path: 'add', component: DailyFieldMasterAddComponent },
  { path: 'detail-page', redirectTo: '' },
  { path: 'detail-page/:uuid', component: DailyFieldMasterDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DailyFieldActivityRoutingModule { }
