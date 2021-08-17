import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddPdcComponent } from './add-pdc/add-pdc.component';
import { PdcDetailPageComponent } from './pdc-detail-page/pdc-detail-page.component';
import { PdcMasterComponent } from './pdc-master/pdc-master.component';


const routes: Routes = [
  { path: '', component: PdcMasterComponent },
  { path: 'add', component: AddPdcComponent },
  { path: 'detail-page', redirectTo: '' },
  { path: 'detail-page/:uuid', component: PdcDetailPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PdcRoutingModule { }
