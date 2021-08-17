
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
  {
    path: 'discount',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./discount/discount.module').then(
        (module) => module.DiscountModule
      ),
  },
  {
    path: 'rebate',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./rebate/rebate.module').then(
        (module) => module.RebateModule
      ),
  },
  {
    path: 'shelf-rent',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./shelf-rent/shelf-rent.module').then(
        (module) => module.ShelfRentModule
      ),
  },

  {
    path: 'listing-fee',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./listing-fee/listing-fee.module').then(
        (module) => module.ListingFeeModule
      ),
  },
  {
    path: 'pricing',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pricing/pricing.module').then(
        (module) => module.PricingModule
      ),
  },
  {
    path: 'promotion',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./promotion/promotion.module').then(
        (module) => module.PromotionModule
      ),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PricingPlanRoutingModule { }
