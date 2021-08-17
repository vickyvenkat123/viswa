import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialImportModule } from './imports/material-import/material-import.module';
import { SettingsDrawerComponent } from './components/drawers/settings-drawer/settings-drawer.component';
import { ProfileDrawerComponent } from './components/drawers/profile-drawer/profile-drawer.component';
import { OrganizationPageComponent } from './components/pages/settings/organization-page/organization-page.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StylePaginatorDirective } from './directives/style-paginator.directive';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { EditRegionFormComponent } from './components/edit-forms/edit-region-form/edit-region-form.component';
import { TitleCasePipe } from '@angular/common';
import { BulkUpdateFormComponent } from './components/dialog-forms/bulk-update-form/bulk-update-form.component';
import { DeleteConfirmModalComponent } from './components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { RegionDeleteDialogComponent } from './components/dialogs/region-delete-dialog/region-delete-dialog.component';
import { SubAreaDeleteDialogComponent } from './components/dialogs/sub-area-delete-dialog/sub-area-delete-dialog.component';
import { AreaDeleteDialogComponent } from './components/dialogs/area-delete-dialog/area-delete-dialog.component';
import { MajorCategoryDeleteDialogComponent } from './components/dialogs/major-category-delete-dialog/major-category-delete-dialog.component';
import { SubCategoryDeleteDialogComponent } from './components/dialogs/sub-category-delete-dialog/sub-category-delete-dialog.component';
import { ItemGroupDeleteDialogComponent } from './components/dialogs/item-group-delete-dialog/item-group-delete-dialog.component';
import { UserRolePageComponent } from './components/pages/settings/user-role-page/user-role-page.component';
import { UsersDtComponent } from './components/datatables/users-dt/users-dt.component';
import { UserDetailComponent } from './components/detail-pages/user-detail/user-detail.component';
import { OrgRoleDtComponent } from './components/datatables/org-role-dt/org-role-dt.component';
import { AddRoleFormComponent } from './components/forms/add-role-form/add-role-form.component';
import { AddUserFormComponent } from './components/forms/add-user-form/add-user-form.component';
import { AddPromotionFormPageComponent } from './components/forms/add-promotion-form-page/add-promotion-form-page.component';
import { AddTaxFormComponent } from './components/forms/add-tax-form/add-tax-form.component';
import { TaxdtComponent } from './components/datatables/taxdt/taxdt.component';
import { TaxdetailComponent } from './components/detail-pages/taxdetail/taxdetail.component';
import { TaxmasterComponent } from './components/pages/settings/taxmaster/taxmaster.component';
import { PayementtermsDialogComponent } from './components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { AddCustomFieldModalComponent } from './components/shared/add-custom-field-modal/add-custom-field-modal.component';
import { InvitationFormPageComponent } from './components/pages/invitation-form-page/invitation-form-page.component';
import { ChartModule } from 'primeng/chart';
import { PreferenceMasterPageComponent } from './components/pages/settings/preference-master-page/preference-master-page.component';
import { PreferenceLeftPanelComponent } from './components/pages/settings/preference-master-page/preference-left-panel/preference-left-panel.component';
import { PreferenceRightPanelComponent } from './components/pages/settings/preference-master-page/preference-right-panel/preference-right-panel.component';
import { AddPreferenceComponent } from './components/forms/add-preference/add-preference.component';
import { CodeDialogComponent } from './components/dialogs/code-dialog/code-dialog.component';
import { TreeViewComponent } from './components/shared/tree-view/tree-view.component';
import { ChannelFormComponent } from './components/dialog-forms/channel-form/channel-form.component';
import { BrandFormComponent } from './components/dialog-forms/brand-form/brand-form.component';
import { CategoryFormComponent } from './components/dialog-forms/category-form/category-form.component';
import { SharedModule } from './features/shared/shared.module';
import { ChannelComponent } from './components/dialog-forms/add-channel/channel.component';
import { AreaFormComponent } from './components/dialog-forms/area-form/area-form.component';
import { SalesOrganisationFormComponent } from './components/dialog-forms/sales-organisation-form/sales-organisation-form.component';
import { WorkflowruleComponent } from './components/pages/preference-right-components/workflowrule/workflowrule.component';
import { PreferenceDetailComponent } from './components/detail-pages/preference-detail/preference-detail.component';
import { ReasonFormComponent } from './components/dialog-forms/reason-form/reason-form.component';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { EditPreferenceComponent } from './components/forms/edit-preference/edit-preference.component';
import { SalesmanDialogComponent } from './components/dialogs/salesman-dialog/salesman-dialog.component';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AddStockDialogComponent } from './components/dialogs/add-stock-dialog/add-stock-dialog.component';
import { ToastrModule } from 'ngx-toastr';
import { AddModelStockDialogComponent } from './components/dialogs/add-modelstock-dialog/add-modelstock-dialog.component';
import { CommonSpinnerComponent } from './components/shared/common-spinner/common-spinner.component';
import { SpinnerInterceptor } from './components/shared/common-spinner/common-spinner.interceptor';
import { InvoiceModule } from './components/main/transaction/invoice/invoice.module';
import { AddSalespersonComponent } from './components/dialogs/add-salesperson/add-salesperson.component';

import { AdvanceSearchModule } from './components/dialog-forms/advance-search-form/advance-search.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PromotionDailogComponent } from './components/dialogs/promotion-dailog/promotion-dailog.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ScheduleDialogComponent } from './components/dialogs/schedule-dialog/schedule-dialog.component';
import { AddJpCustomerDialogComponent } from './components/dialogs/add-jp-customer-dialog/add-jp-customer-dialog.component';
import { APP_INITIALIZER, ErrorHandler } from "@angular/core";
import { Router } from "@angular/router";
import * as Sentry from "@sentry/angular";
import { ReportCustomFilterComponent } from './components/dialogs/report-custom-filter/report-custom-filter.component';
import { EditModelstockItemDialogComponent } from './components/dialogs/edit-modelstock-item-dialog/edit-modelstock-item-dialog.component';
import { DebitOptionsDialogComponent } from './components/dialogs/debit-options-dialog/debit-options-dialog.component';
import { SalesmanSupervisorFormComponent } from './components/dialog-forms/salesman-supervisor-form/salesman-supervisor-form.component';
import { NotificationsDrawerComponent } from './components/drawers/notification-drawer/notifications-drawer.component';
import { MBDoubleLoadComponent } from './components/pages/settings/mb-double-load/mb-double-load.component';

@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    NavbarComponent,
    SettingsDrawerComponent,
    ProfileDrawerComponent,
    OrganizationPageComponent,
    MBDoubleLoadComponent,
    StylePaginatorDirective,

    EditRegionFormComponent,
    BulkUpdateFormComponent,
    DeleteConfirmModalComponent,
    ClickStopPropagationDirective,
    RegionDeleteDialogComponent,
    SubAreaDeleteDialogComponent,
    AreaDeleteDialogComponent,
    MajorCategoryDeleteDialogComponent,
    SubCategoryDeleteDialogComponent,
    ItemGroupDeleteDialogComponent,
    UserRolePageComponent,
    UsersDtComponent,
    UserDetailComponent,
    OrgRoleDtComponent,
    AddRoleFormComponent,
    AddUserFormComponent,
    AddPromotionFormPageComponent,
    AddTaxFormComponent,
    TaxdtComponent,
    TaxdetailComponent,
    TaxmasterComponent,
    PayementtermsDialogComponent,
    AddCustomFieldModalComponent,
    InvitationFormPageComponent,

    PreferenceMasterPageComponent,
    PreferenceLeftPanelComponent,
    PreferenceRightPanelComponent,
    AddPreferenceComponent,
    CodeDialogComponent,
    TreeViewComponent,
    ChannelFormComponent,
    BrandFormComponent,
    CategoryFormComponent,
    ChannelComponent,
    AreaFormComponent,
    SalesOrganisationFormComponent,
    WorkflowruleComponent,
    PreferenceDetailComponent,
    ReasonFormComponent,
    EditPreferenceComponent,
    SalesmanDialogComponent,
    AddStockDialogComponent,
    AddModelStockDialogComponent,
    CommonSpinnerComponent,
    AddSalespersonComponent,
    PromotionDailogComponent,
    ScheduleDialogComponent,
    AddJpCustomerDialogComponent,
    ReportCustomFilterComponent,
    EditModelstockItemDialogComponent,
    DebitOptionsDialogComponent,
    SalesmanSupervisorFormComponent,
    NotificationsDrawerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialImportModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ChartModule,
    InvoiceModule,
    SharedModule,
    NgbModule,
    AdvanceSearchModule,
    NgxSpinnerModule,
    NgxDaterangepickerMd.forRoot(),
    ToastrModule.forRoot(),
    NgxSpinnerModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  providers: [
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => { },
      deps: [Sentry.TraceService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerInterceptor,
      multi: true,
    },

    TitleCasePipe,
    NgbActiveModal,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    RegionDeleteDialogComponent,
    SubAreaDeleteDialogComponent,
    StylePaginatorDirective,
    ClickStopPropagationDirective,
    BulkUpdateFormComponent,
    CodeDialogComponent,
    AddStockDialogComponent,
    AddModelStockDialogComponent,
    ScheduleDialogComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
