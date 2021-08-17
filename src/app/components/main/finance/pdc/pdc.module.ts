import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PdcRoutingModule } from './pdc-routing.module';
import { AddPdcComponent } from './add-pdc/add-pdc.component';
import { PdcDetailPageComponent } from './pdc-detail-page/pdc-detail-page.component';
import { PdcDtComponent } from './pdc-dt/pdc-dt.component';
import { PdcMasterComponent } from './pdc-master/pdc-master.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { CashierReceiptService } from '../cashier-receipt/cashier-receipt.service';


@NgModule({
  declarations: [AddPdcComponent, PdcDetailPageComponent, PdcDtComponent, PdcMasterComponent],
  imports: [
    CommonModule,
    PdcRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    SharedModule,
  ],
  providers: [CashierReceiptService],
})
export class PdcModule { }
