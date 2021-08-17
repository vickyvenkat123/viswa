import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListingFeeRoutingModule } from './listing-fee-routing.module';
import { ListingFeePageComponent } from './listing-fee-page/listing-fee-page.component';
import { ListingFeeDtComponent } from './listing-fee-dt/listing-fee-dt.component';
import { ListingFeeDetailsComponent } from './listing-fee-details/listing-fee-details.component';
import { ListingFeeFormComponent } from './listing-fee-form/listing-fee-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';


@NgModule({
  declarations: [ListingFeePageComponent, ListingFeeDtComponent, ListingFeeDetailsComponent, ListingFeeFormComponent],
  imports: [
    CommonModule,
    ListingFeeRoutingModule,
    MaterialImportModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class ListingFeeModule { }
