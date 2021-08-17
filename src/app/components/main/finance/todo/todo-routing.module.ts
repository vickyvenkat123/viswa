import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TodoAddComponent } from './todo-add/todo-add.component';
import { TodoDetailComponent } from './todo-detail/todo-detail.component';
import { TodoMasterComponent } from './todo-master/todo-master.component';


const routes: Routes = [
  { path: '', component: TodoMasterComponent },
  { path: 'add', component: TodoAddComponent },
  { path: 'detail-page', redirectTo: '' },
  { path: 'detail-page/:uuid', component: TodoDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TodoRoutingModule { }
