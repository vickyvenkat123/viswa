import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonDashboardComponent } from './components/common-dashboard/common-dashboard.component';
import { IframeDashboard10Component } from './components/iframe-dashboard10/iframe-dashboard10.component';
import { IframeDashboard11Component } from './components/iframe-dashboard11/iframe-dashboard11.component';
import { IframeDashboard12Component } from './components/iframe-dashboard12/iframe-dashboard12.component';
import { IframeDashboard6Component } from './components/iframe-dashboard6/iframe-dashboard6.component';
import { IframeDashboard7Component } from './components/iframe-dashboard7/iframe-dashboard7.component';
import { IframeDashboard8Component } from './components/iframe-dashboard8/iframe-dashboard8.component';
import { IframeDashboard9Component } from './components/iframe-dashboard9/iframe-dashboard9.component';
import { MerchandisingDashboardComponent } from './components/merchandising-dashboard/merchandising-dashboard.component';
import { MerchandisingDashboard2Component } from './components/merchandising-dashboard2/merchandising-dashboard2.component';
import { MerchandisingDashboard4Component } from './components/merchandising-dashboard4/merchandising-dashboard4.component';
import { MerchanidisingDashboard3Component } from './components/merchanidising-dashboard3/merchanidising-dashboard3.component';
import { DashboardPageComponent } from './views/dashboard-page/dashboard-page.component';

const routes: Routes = [
  {
    path: '', component: DashboardPageComponent,
    children: [
      { path: 'board1', component: MerchandisingDashboardComponent },
      { path: 'board2', component: MerchandisingDashboard2Component },
      { path: 'board3', component: MerchanidisingDashboard3Component },
      { path: 'board4', component: MerchandisingDashboard4Component },
      { path: 'board5', component: CommonDashboardComponent },
      { path: 'board6', component: IframeDashboard6Component },
      { path: 'board7', component: IframeDashboard7Component },
      { path: 'board8', component: IframeDashboard8Component },
      { path: 'board9', component: IframeDashboard9Component },
      { path: 'board10', component: IframeDashboard10Component },
      { path: 'board11', component: IframeDashboard11Component },
      { path: 'board12', component: IframeDashboard12Component },
    ]
  },

];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
