import { ListingFeePageComponent } from './listing-fee-page/listing-fee-page.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListingFeeFormComponent } from './listing-fee-form/listing-fee-form.component';


const routes: Routes = [
  {
    path: '',
    component: ListingFeePageComponent
  },
  {
    path: 'add',
    component: ListingFeeFormComponent
  },
  {
    path: 'edit/:uuid',
    component: ListingFeeFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListingFeeRoutingModule { }
