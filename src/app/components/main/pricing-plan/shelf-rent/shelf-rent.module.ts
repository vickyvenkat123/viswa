import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShelfRentRoutingModule } from './shelf-rent-routing.module';
import { ShelfRentPageComponent } from './shelf-rent-page/shelf-rent-page.component';
import { ShelfRentFormComponent } from './shelf-rent-form/shelf-rent-form.component';
import { ShelfRentDtComponent } from './shelf-rent-dt/shelf-rent-dt.component';
import { ShelfRentDetailComponent } from './shelf-rent-detail/shelf-rent-detail.component';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/features/shared/shared.module';


@NgModule({
  declarations: [ShelfRentPageComponent, ShelfRentFormComponent, ShelfRentDtComponent, ShelfRentDetailComponent],
  imports: [
    CommonModule,
    ShelfRentRoutingModule,
    MaterialImportModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
  ]
})
export class ShelfRentModule { }
