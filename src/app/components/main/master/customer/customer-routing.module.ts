import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CustomerPageComponent } from './customer-page/customer-page.component';
import { CustomerResolveService } from './customer-resolve.service';
import { CustomerImportComponent } from './customer-import/customer-import.component';


const routes: Routes = [
  {
    path: '',
    resolve: {
      customer_resolve: CustomerResolveService
    },
    component: CustomerPageComponent
  },
  {
  	path: 'import',
  	component : CustomerImportComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule { }