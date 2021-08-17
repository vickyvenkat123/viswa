import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DailyFieldActivityRoutingModule } from './daily-field-activity-routing.module';
import { DailyFieldMasterComponent } from './daily-field-master/daily-field-master.component';
import { DailyFieldMasterDtComponent } from './daily-field-master-dt/daily-field-master-dt.component';
import { DailyFieldMasterDetailComponent } from './daily-field-master-detail/daily-field-master-detail.component';
import { DailyFieldMasterAddComponent } from './daily-field-master-add/daily-field-master-add.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';


@NgModule({
  declarations: [DailyFieldMasterComponent, DailyFieldMasterDtComponent, DailyFieldMasterDetailComponent, DailyFieldMasterAddComponent],
  imports: [
    CommonModule,
    DailyFieldActivityRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    SharedModule
  ]
})
export class DailyFieldActivityModule { }
