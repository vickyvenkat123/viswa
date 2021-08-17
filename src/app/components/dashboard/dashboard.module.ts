import { HttpClientModule } from '@angular/common/http';
import { MaterialImportModule } from './../../imports/material-import/material-import.module';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPageComponent } from './views/dashboard-page/dashboard-page.component';
import { CalendarModule } from 'angular-calendar';
import { MerchandisingDashboardComponent } from './components/merchandising-dashboard/merchandising-dashboard.component';
import { CommonDashboardComponent } from './components/common-dashboard/common-dashboard.component';
import { MerchandisingDetailComponent } from './components/merchandising-detail/merchandising-detail.component';
import { Merchandising4DetailComponent } from './components/merchandising-detail-dashboard-4/merchandising-detail-dashboard-4.component';
import { DashboardChartDetailComponent } from './components/dashboard-chart-detail/dashboard-chart-detail.component';
import { MerchandisingDashboard2Component } from './components/merchandising-dashboard2/merchandising-dashboard2.component';
import { MerchanidisingDashboard3Component } from './components/merchanidising-dashboard3/merchanidising-dashboard3.component';
import { MerchandisingDashboard4Component } from './components/merchandising-dashboard4/merchandising-dashboard4.component';
import { IframeDashboard6Component } from './components/iframe-dashboard6/iframe-dashboard6.component';
import { IframeDashboard7Component } from './components/iframe-dashboard7/iframe-dashboard7.component';
import { IframeDashboard8Component } from './components/iframe-dashboard8/iframe-dashboard8.component';
import { IframeDashboard9Component } from './components/iframe-dashboard9/iframe-dashboard9.component';
import { IframeDashboard10Component } from './components/iframe-dashboard10/iframe-dashboard10.component';
import { IframeDashboard11Component } from './components/iframe-dashboard11/iframe-dashboard11.component';
import { IframeDashboard12Component } from './components/iframe-dashboard12/iframe-dashboard12.component';

@NgModule({
  declarations: [
    DashboardPageComponent,
    MerchandisingDashboardComponent,
    CommonDashboardComponent,
    MerchandisingDetailComponent,
    DashboardChartDetailComponent,
    Merchandising4DetailComponent,
    MerchandisingDashboard2Component,
    MerchanidisingDashboard3Component,
    MerchandisingDashboard4Component,
    IframeDashboard6Component,
    IframeDashboard7Component,
    IframeDashboard8Component,
    IframeDashboard9Component,
    IframeDashboard10Component,
    IframeDashboard11Component,
    IframeDashboard12Component,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    DashboardRoutingModule,
    CalendarModule,
    HttpClientModule,
  ],
})
export class DashboardModule { }
