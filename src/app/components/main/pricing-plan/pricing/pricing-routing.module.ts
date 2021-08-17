import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PricingPageComponent } from './pricing-page/pricing-page.component';
import { PricingFormComponent } from './pricing-form/pricing-form.component';

const routes: Routes = [
  {
    path: '',
    component: PricingPageComponent,
  },
  {
    path: 'add',
    component: PricingFormComponent,
  },
  {
    path: 'edit/:uuid',
    component: PricingFormComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PricingRoutingModule {}
