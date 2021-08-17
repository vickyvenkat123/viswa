import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { MaterialImportModule } from 'src/app/imports/material-import/material-import.module';
import { LightboxModule } from 'ngx-lightbox';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportMasterComponent } from './report-master/report-master.component';
import { PlanogramReportComponent } from './planogram-report/planogram-report.component';
import { VisualMerchandisingComponent } from './visual-merchandising/visual-merchandising.component';
import { MerchandisingAuditComponent } from './merchandising-audit/merchandising-audit.component';
import { CategoryComponent } from './category/category.component';
import { CompetitorProductComponent } from './competitor-product/competitor-product.component';
import { OrderReturnsComponent } from './order-returns/order-returns.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { PhotosComponent } from './photos/photos.component';
import { NewCustomerComponent } from './new-customer/new-customer.component';
import { ClosedVisitsComponent } from './closed-visits/closed-visits.component';
import { VisitSummaryComponent } from './visit-summary/visit-summary.component';
import { OrderSumamryComponent } from './order-sumamry/order-sumamry.component';
import { OrderItemsComponent } from './order-items/order-items.component';
import { TaskAnswersComponent } from './task-answers/task-answers.component';
import { TaskPhotosComponent } from './task-photos/task-photos.component';
import { TaskSummaryComponent } from './task-summary/task-summary.component';
import { SosComponent } from './sos/sos.component';
import { StockAvailibilityComponent } from './stock-availibility/stock-availibility.component';
import { StoreSummaryComponent } from './store-summary/store-summary.component';
import { SubtableComponent } from './store-summary/subtable/subtable.component';
import { SubAnswertableComponent } from './task-answers/subanswertable/subanswertable.component';
import { ItemtableComponent } from './order-sumamry/itemtable/itemtable.component';
import { ActivitytableComponent } from './timesheets/activitytable/activitytable.component';
import { CustomerTableComponent } from './timesheets/customer-table/customer-table.component';
import { JpComplianceComponent } from './jp-compliance/jp-compliance.component';
import { SalesmanLoginLogComponent } from './salesman-login-log/salesman-login-log.component';
import { LoadSheetComponent } from './load-sheet/load-sheet.component';
import { LoadItemtableComponent } from './load-sheet//itemtable/itemtable.component';
import { CarryOverItemtableComponent } from './carry-over//itemtable/itemtable.component';
import { OrderItemtableComponent } from './order-reports//itemtable/itemtable.component';
import { SalesAnalysisComponent } from './sales-analysis/sales-analysis.component';
import { PeriodicWiseCollectionComponent } from './periodic-wise-collection/periodic-wise-collection.component';
import { SalesSummaryByProductClassComponent } from './sales-summary-by-product-class/sales-summary-by-product-class.component';
import { ProductSummaryByCustomerSalesComponent } from './product-summary-by-customer-sales/product-summary-by-customer-sales.component';
import { CustomerSalesPerMonthComponent } from './customer-sales-per-month/customer-sales-per-month.component';
import { CustomerStatementComponent } from './customer-statement/customer-statement.component';
import { CustomerSummaryByProductComponent } from './customer-summary-by-product/customer-summary-by-product.component';
import { OrderReportsComponent } from './order-reports/order-reports.component';
import { VanCustomerComponent } from './van-customer/van-customer.component';
import { WeeklyCustomerComponent } from './weekly-customer/weekly-customer.component';
import { VisitAnalysisByVanorSalesmanComponent } from './visit-analysis-by-vanor-salesman/visit-analysis-by-vanor-salesman.component';
import { CarryOverComponent } from './carry-over/carry-over.component';
import { DailyFieldActivityComponent } from './daily-field-activity/daily-field-activity.component';
import { MonthlyAgeingComponent } from './monthly-ageing/monthly-ageing.component';
import { SalesQuantityAnalysisComponent } from './sales-quantity-analysis/sales-quantity-analysis.component';
import { TripExcecutionComponent } from './trip-excecution/trip-excecution.component';
import { EndInventoryComponent } from './end-inventory/end-inventory.component';

@NgModule({
  declarations: [ReportMasterComponent, PlanogramReportComponent, VisualMerchandisingComponent, MerchandisingAuditComponent, CategoryComponent, CompetitorProductComponent, OrderReturnsComponent, TimesheetsComponent, PhotosComponent, NewCustomerComponent, ClosedVisitsComponent, VisitSummaryComponent, OrderSumamryComponent, OrderItemsComponent, TaskAnswersComponent, TaskPhotosComponent, TaskSummaryComponent, SosComponent, StockAvailibilityComponent, StoreSummaryComponent, SubtableComponent, ItemtableComponent, SubAnswertableComponent, ActivitytableComponent, CustomerTableComponent, JpComplianceComponent, SalesmanLoginLogComponent, LoadSheetComponent, LoadItemtableComponent, SalesAnalysisComponent, PeriodicWiseCollectionComponent, SalesSummaryByProductClassComponent, ProductSummaryByCustomerSalesComponent, CustomerSalesPerMonthComponent, CustomerStatementComponent, CustomerSummaryByProductComponent, OrderReportsComponent, VanCustomerComponent, WeeklyCustomerComponent, VisitAnalysisByVanorSalesmanComponent, CarryOverComponent, DailyFieldActivityComponent, MonthlyAgeingComponent, SalesQuantityAnalysisComponent, TripExcecutionComponent, CarryOverItemtableComponent, OrderItemtableComponent, EndInventoryComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialImportModule,
    LightboxModule,
    ReportsRoutingModule
  ]
})
export class ReportsModule { }
