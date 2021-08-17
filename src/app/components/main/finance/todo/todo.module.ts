import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TodoRoutingModule } from './todo-routing.module';
import { TodoMasterComponent } from './todo-master/todo-master.component';
import { TodoDtComponent } from './todo-dt/todo-dt.component';
import { TodoDetailComponent } from './todo-detail/todo-detail.component';
import { TodoAddComponent } from './todo-add/todo-add.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';


@NgModule({
  declarations: [TodoMasterComponent, TodoDtComponent, TodoDetailComponent, TodoAddComponent],
  imports: [
    CommonModule,
    TodoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    SharedModule
  ]
})
export class TodoModule { }
