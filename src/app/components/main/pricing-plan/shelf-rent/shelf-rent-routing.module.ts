import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShelfRentFormComponent } from './shelf-rent-form/shelf-rent-form.component';
import { ShelfRentPageComponent } from './shelf-rent-page/shelf-rent-page.component';


const routes: Routes = [
  {
    path: '',
    component: ShelfRentPageComponent,
  },
  {
    path: 'add',
    component: ShelfRentFormComponent,
  },
  {
    path: 'edit/:uuid',
    component: ShelfRentFormComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShelfRentRoutingModule { }
