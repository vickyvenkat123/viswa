import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RebateRoutingModule } from './rebate-routing.module';
import { RebatePageComponent } from './rebate-page/rebate-page.component';
import { RebateDtComponent } from './rebate-dt/rebate-dt.component';
import { RebateDetailsComponent } from './rebate-details/rebate-details.component';
import { RebateFormComponent } from './rebate-form/rebate-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';


@NgModule({
  declarations: [RebatePageComponent, RebateDtComponent, RebateDetailsComponent, RebateFormComponent],
  imports: [
    CommonModule,
    RebateRoutingModule,
    MaterialImportModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class RebateModule { }
