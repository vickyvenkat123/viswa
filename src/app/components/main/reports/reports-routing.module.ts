import { EndInventoryComponent } from './end-inventory/end-inventory.component';
import { TripExcecutionComponent } from './trip-excecution/trip-excecution.component';
import { SalesQuantityAnalysisComponent } from './sales-quantity-analysis/sales-quantity-analysis.component';
import { MonthlyAgeingComponent } from './monthly-ageing/monthly-ageing.component';
import { DailyFieldActivityComponent } from './daily-field-activity/daily-field-activity.component';
import { CarryOverComponent } from './carry-over/carry-over.component';
import { VisitAnalysisByVanorSalesmanComponent } from './visit-analysis-by-vanor-salesman/visit-analysis-by-vanor-salesman.component';
import { WeeklyCustomerComponent } from './weekly-customer/weekly-customer.component';
import { VanCustomerComponent } from './van-customer/van-customer.component';
import { OrderReportsComponent } from './order-reports/order-reports.component';
import { CustomerSummaryByProductComponent } from './customer-summary-by-product/customer-summary-by-product.component';
import { CustomerStatementComponent } from './customer-statement/customer-statement.component';
import { CustomerSalesPerMonthComponent } from './customer-sales-per-month/customer-sales-per-month.component';
import { ProductSummaryByCustomerSalesComponent } from './product-summary-by-customer-sales/product-summary-by-customer-sales.component';
import { SalesSummaryByProductClassComponent } from './sales-summary-by-product-class/sales-summary-by-product-class.component';
import { PeriodicWiseCollectionComponent } from './periodic-wise-collection/periodic-wise-collection.component';
import { SalesAnalysisComponent } from './sales-analysis/sales-analysis.component';
import { LoadSheetComponent } from './load-sheet/load-sheet.component';
import { StoreSummaryComponent } from './store-summary/store-summary.component';
import { StockAvailibilityComponent } from './stock-availibility/stock-availibility.component';
import { SosComponent } from './sos/sos.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskSummaryComponent } from './task-summary/task-summary.component';
import { TaskPhotosComponent } from './task-photos/task-photos.component';
import { TaskAnswersComponent } from './task-answers/task-answers.component';
import { OrderItemsComponent } from './order-items/order-items.component';
import { OrderSumamryComponent } from './order-sumamry/order-sumamry.component';
import { VisitSummaryComponent } from './visit-summary/visit-summary.component';
import { ClosedVisitsComponent } from './closed-visits/closed-visits.component';
import { NewCustomerComponent } from './new-customer/new-customer.component';
import { PhotosComponent } from './photos/photos.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { OrderReturnsComponent } from './order-returns/order-returns.component';
import { CompetitorProductComponent } from './competitor-product/competitor-product.component';
import { CategoryComponent } from './category/category.component';
import { MerchandisingAuditComponent } from './merchandising-audit/merchandising-audit.component';
import { VisualMerchandisingComponent } from './visual-merchandising/visual-merchandising.component';
import { PlanogramReportComponent } from './planogram-report/planogram-report.component';
import { JpComplianceComponent } from './jp-compliance/jp-compliance.component';
import { ReportMasterComponent } from './report-master/report-master.component';
import { SalesmanLoginLogComponent } from './salesman-login-log/salesman-login-log.component';



const routes: Routes = [
  // { path: '', redirectTo: 'planogram-compliance', pathMatch: 'full' },
  {
    path: '',
    component: ReportMasterComponent,
    children: [
      //Merchandising
      { path: 'planogram-compliance', component: PlanogramReportComponent },
      { path: 'visual-merchandising', component: VisualMerchandisingComponent },
      { path: 'merchandising-audit', component: MerchandisingAuditComponent },
      { path: 'category', component: CategoryComponent },
      { path: 'jp-compliance', component: JpComplianceComponent },
      { path: 'competitor-product', component: CompetitorProductComponent },
      { path: 'order-returns', component: OrderReturnsComponent },
      { path: 'timesheets', component: TimesheetsComponent },
      { path: 'photos', component: PhotosComponent },
      { path: 'new-customer', component: NewCustomerComponent },
      { path: 'closed-visits', component: ClosedVisitsComponent },
      { path: 'visit-summary', component: VisitSummaryComponent },
      { path: 'order-sumamry', component: OrderSumamryComponent },
      { path: 'order-items', component: OrderItemsComponent },
      { path: 'task-answers', component: TaskAnswersComponent },
      { path: 'task-photos', component: TaskPhotosComponent },
      { path: 'task-summary', component: TaskSummaryComponent },
      { path: 'sos', component: SosComponent },
      { path: 'stock-availability', component: StockAvailibilityComponent },
      { path: 'store-summary', component: StoreSummaryComponent },
      { path: 'merchandiser-login-log', component: SalesmanLoginLogComponent },
      //Vansales
      { path: 'load-sheet', component: LoadSheetComponent },
      { path: 'sales-analysis', component: SalesAnalysisComponent },
      { path: 'periodic-wise-collection', component: PeriodicWiseCollectionComponent },
      { path: 'sales-summary-by-product-class', component: SalesSummaryByProductClassComponent },
      { path: 'product-summary-by-customer-sales', component: ProductSummaryByCustomerSalesComponent },
      { path: 'customer-sales-per-month', component: CustomerSalesPerMonthComponent },
      { path: 'customer-statement', component: CustomerStatementComponent },
      { path: 'customer-summary-by-product', component: CustomerSummaryByProductComponent },
      { path: 'order-reports', component: OrderReportsComponent },
      { path: 'van-customer', component: VanCustomerComponent },
      { path: 'weekly-customer', component: WeeklyCustomerComponent },
      { path: 'visit-analysis-by-van-or-salesman', component: VisitAnalysisByVanorSalesmanComponent },
      { path: 'carry-over', component: CarryOverComponent },
      { path: 'daily-field-activity', component: DailyFieldActivityComponent },
      { path: 'monthly-ageing', component: MonthlyAgeingComponent },
      { path: 'sales-quantity-analysis', component: SalesQuantityAnalysisComponent },
      { path: 'end-inventory', component: EndInventoryComponent },
      { path: 'trip-execution', component: TripExcecutionComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
