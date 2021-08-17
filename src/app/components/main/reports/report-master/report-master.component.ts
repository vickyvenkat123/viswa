import { ReportService } from './../report.service';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DataEditor } from 'src/app/services/data-editor.service';
import { ScheduleDialogComponent } from './../../../dialogs/schedule-dialog/schedule-dialog.component';
import { ReportCustomFilterComponent } from './../../../dialogs/report-custom-filter/report-custom-filter.component';
import { CompDataServiceType } from 'src/app/services/constants';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { MasterService } from '../../master/master.service';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { Subscription, Subject } from 'rxjs';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
import { Customer } from '../../master/customer/customer-dt/customer-dt.component';
import { ReportCustomDateFilterModel } from 'src/app/interfaces/ReportCustomDateFilter.interface';

@Component({
  selector: 'app-report-master',
  templateUrl: './report-master.component.html',
  styleUrls: ['./report-master.component.scss'],
})
export class ReportMasterComponent extends BaseComponent implements OnInit {
  @ViewChild('formDrawer') formDrawer: MatDrawer;
  public reportNavOptions: any[] = [];
  public activeRoute: string;
  public SelectedRport: string;
  public intervalSelected: FormControl;
  public customerSelected: FormControl;
  public showSidePanle = false;
  public selectedReportData = [];
  public domain = window.location.host.split('.')[0];
  org_name = localStorage.getItem('org_name');


  intervals = [
    { id: 'today', name: 'Today' },
    { id: 'current_week', name: 'This Week' },
    { id: 'current_month', name: 'This Month' },
    { id: 'current_quarter', name: 'This Quarter' },
    { id: 'current_year', name: 'This Year' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'previous_week', name: 'Previous Week' },
    { id: 'previous_month', name: 'Previous Month' },
    { id: 'previous_quarter', name: 'Previous Quarter' },
    { id: 'previous_year', name: 'Previous Year' },
    { id: 'custom', name: 'Custom' },
  ];
  customers = [];
  cust_List = [];
  filterCustomer = [];
  selectedPopover: string;
  start_date: any;
  end_date: any;
  export_type = '';
  export = 0;
  module_name = '';
  sideFiltersForm;
  regionList = [];
  routeList = [];
  divisionList = [];
  supervisorList = [];
  salesmanList = [];
  customerList = [];
  public isLoading: boolean;
  public page = 1;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public lookup$: Subject<any> = new Subject();
  filterValue: string = "";
  private subscriptions: Subscription[] = [];
  public customerFormControl: FormControl;
  itemCategoryList = [];

  constructor(
    private route: Router,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dataEditor: DataEditor,
    private ReportService: ReportService,
    private fds: FormDrawerService,
    private fb: FormBuilder,
    private masterService: MasterService
  ) {
    super('reports');
  }

  ngAfterViewInit(): void {
    this.fds.setDrawer(this.formDrawer);
  }


  openFilters() {
    this.fds.setFormName('Report-Filters');
    this.fds.setFormType("Filters");
    this.fds.open();
  }

  close() {
    this.fds.close();
  }
  runReport() {
    // if (this.SelectedRport == 'Customer Statement') {
    //   this.getCustomerReport();
    // } else {
    this.getDatabyFilter();
    // }
  }

  getCustomerReport() {
    let start_date = this.start_date.split('/');
    start_date = start_date[0] + '-' + start_date[1] + '-' + start_date[2];
    let end_date = this.end_date.split('/');
    end_date = end_date[0] + '-' + end_date[1] + '-' + end_date[2];
    let body = {
      "start_date": start_date,
      "end_date": end_date,
      "export": 0,
      "export_type": "",
      "module": "balance-sheet",
      "customer": this.customerSelected.value
    }
    this.ReportService.merchandisingReports(body).subscribe((res) => {
      if (res?.status == true) {
        this.selectedReportData = res.data;
        this.dataEditor.sendData({
          type: CompDataServiceType.CUSTOMER_DATA,
          request: body,
          data: res.data,
        });
      }
    })
  }

  ngOnInit(): void {
    this.sideFiltersForm = this.fb.group({
      division: [[]],
      region: [[]],
      route: [[]],
      supervisor: [[]],
      salesman: [[]],
      item_category: [[]],
      customer: [[]]
    })
    this.customerFormControl = new FormControl('');

    const sidebarContainer = document.querySelector('._sidenav');
    sidebarContainer.classList.toggle('collapse_sidenav');
    this.apiService
      .getCustomers().subscribe((res) => {
        this.cust_List = res.data;
        console.log(this.cust_List);
      });
    this.apiService.getMasterDataLists().subscribe((result: any) => {
      this.customers = result.data.customers;
      this.customerList = result.data.customers;
      for (let customer of this.customerList) {
        customer['customer_name'] = `${customer.firstname} ${customer.lastname}`;
        customer['id'] = customer?.customer_info.user_id;
      }
      console.log('This', this.customerList);
      this.regionList = result.data.region;
      this.routeList = result.data.route;
      this.itemCategoryList = result.data.item_major_category_list;
      this.salesmanList = result.data.salesmans;
      for (let salesman of this.salesmanList) {
        salesman['salesman_name'] = `${salesman.firstname} ${salesman.lastname}`;
      }
    })

    this.apiService.getLobs().subscribe(lobs => {
      this.divisionList = lobs.data;
    })
    this.intervalSelected = new FormControl('current_week');
    this.customerSelected = new FormControl('');

    this.reportNavOptions = null;//JSON.parse(localStorage.getItem('reportbar'));

    if (!this.reportNavOptions) {
      this.apiService.getReportNavOptions().subscribe((res: any[]) => {
        this.reportNavOptions = res;
        this.mapReportOptions();
        localStorage.setItem('reportbar', JSON.stringify(res));
      });
    } else {
      this.mapReportOptions();
    }

    // this.masterService.customerDetailListTable({ page: this.page, page_size: 10 }).subscribe((result) => {
    //   this.page++;
    //   this.filterCustomer = result.data;
    //   this.total_pages = result.pagination?.total_pages
    // })

    // this.lookup$
    //   .pipe(debounceTime(500), exhaustMap(() => {
    //     return this.masterService.customerDetailListTable({ name: this.filterValue, page: this.page, page_size: this.page_size })
    //   }))
    //   .subscribe(res => {
    //     if (this.filterValue == "") {
    //       if (this.page > 1) {
    //         this.filterCustomer = [...this.filterCustomer, ...res.data];
    //       } else {
    //         this.filterCustomer = res.data;
    //       }
    //       this.page++;
    //       this.total_pages = res?.pagination?.total_pages;
    //     } else {
    //       this.page = 1;
    //       this.filterCustomer = res.data;
    //     }
    //     this.isLoading = false;
    //   });
    // this.subscriptions.push(
    //   this.customerFormControl.valueChanges
    //     .pipe(
    //       debounceTime(200),
    //       startWith<string | Customer>(''),
    //       map((value) => (typeof value === 'string' ? value : value?.user?.firstname)),
    //       map((value: string) => {
    //         return value;
    //       })
    //     ).subscribe((res) => {
    //       this.filterValue = res || "";
    //       this.lookup$.next(this.page)
    //     })
    // );
  }
  public customerControlDisplayValue(customer: Customer): string {
    return `${customer?.user?.firstname ? customer?.user?.firstname : ''} ${customer?.user?.lastname ? customer?.user?.lastname : ''}`
  }

  // filterCustomers(value) {
  //   this.filterValue = value || "";
  //   this.page = 1;
  //   this.isLoading = true;
  //   this.lookup$.next(this.page)
  //   this.filterCustomer = [];
  // }

  selectedCustomer(): void {
    if (this.customerFormControl.value && this.customerFormControl.value.length > 0)
      this.customerSelected.setValue(this.customerFormControl.value[0].id);
  }

  onScroll() {
    if (this.total_pages < this.page) return;
    this.isLoading = true;
    this.lookup$.next(this.page);
  }
  getSupervisorsByRegion() {
    let id = this.sideFiltersForm.get('region').value[0]?.id;
    this.ReportService.regionSupervisorSalesman(id).subscribe((result: any) => {
      this.supervisorList = [result.data[0]["salesman_supervisor"]];
    })
    this.filterCustomerData(id);
  }

  getSupervisorsByRoute() {
    let id = this.sideFiltersForm.get('route').value[0]?.id;
    this.ReportService.regionSupervisorSalesman(id).subscribe((result: any) => {
      this.supervisorList = [result.data[0]["salesman_supervisor"]];
      // this.salesmanList = result.data[0]["salesmans"];
    })
  }

  onSelectDivison() {
    this.sideFiltersForm.get('region').setValue([]);
    this.sideFiltersForm.get('route').setValue([]);
    this.filterSalesman();

    var divisions = this.sideFiltersForm.get('division').value.length > 0 ? this.sideFiltersForm.get('division').value.map(x => x.id) : [];
    this.ReportService.customerList(divisions).subscribe((result: any) => {
      this.customerList = [];
      result.data.forEach(element => {
        if (element.customer_id && this.customerList.findIndex(x => x.id == element.customer_id) == -1) {
          var _supervisor = {
            customer_name: element.customer_name,
            id: element.customer_id,
          };

          this.customerList.push(_supervisor);
        }
      });
    })
  }

  filterSalesman() {
    this.sideFiltersForm.get('supervisor').setValue([]);
    this.sideFiltersForm.get('salesman').setValue([]);
    var divisions = this.sideFiltersForm.get('division').value.length > 0 ? this.sideFiltersForm.get('division').value.map(x => x.id) : [];
    var regions = this.sideFiltersForm.get('region').value.length > 0 ? this.sideFiltersForm.get('region').value.map(x => x.id) : [];
    var routes = this.sideFiltersForm.get('route').value.length > 0 ? this.sideFiltersForm.get('region').value.map(x => x.id) : [];

    this.ReportService.filterSalesman(divisions, regions, routes).subscribe((result: any) => {
      this.salesmanList = [];
      result.data.forEach(element => {
        if (element.salesman_id && this.salesmanList.findIndex(x => x.id == element.salesman_id) == -1) {
          var _salesman = {
            salesman_name: element.salesman_name,
            id: element.salesman_id,
          };

          this.salesmanList.push(_salesman);
        }
      });
    });

    this.ReportService.getFilterData(divisions, regions, routes).subscribe((result: any) => {
      this.routeList = [];
      this.regionList = []
      result.data.forEach(element => {
        if (element.region_id && this.regionList.findIndex(x => x.id == element.region_id) == -1) {
          var _region = {
            region_name: element.region_name,
            id: element.region_id,
          };

          this.regionList.push(_region);
        }
        if (element.route_id && this.routeList.findIndex(x => x.id == element.route_id) == -1) {
          var _route = {
            route_name: element.route_name,
            id: element.route_id,
          };

          this.routeList.push(_route);
        }
      });
    });

    this.ReportService.supervisorList(divisions, regions, routes).subscribe((result: any) => {
      this.supervisorList = [];
      result.data.forEach(element => {
        if (element.supervisor_id && this.supervisorList.findIndex(x => x.id == element.salesman_id) == -1) {
          var _supervisor = {
            supervisor_name: element.supervisor_name,
            id: element.supervisor_id,
          };

          this.supervisorList.push(_supervisor);
        }
      });
    })
  }

  filterCustomerData(regionid) {
    if (regionid) {
      this.customerList = [];
      this.customerList = this.customers.filter((x) => x.customer_info.region_id.indexOf(regionid) > -1)
    } else {
      this.customerList = [];
      this.customerList = this.customers;
    }
  }

  getItemCategory() {

  }

  getCustomer() {
    let id = this.sideFiltersForm.get('region').value[0]?.id;
    this.ReportService.regionSupervisorSalesman(id).subscribe((result: any) => {
      this.supervisorList = [result.data[0]["salesman_supervisor"]];
      // this.salesmanList = result.data[0]["salesmans"];
    })
  }

  getSalesmans() {

  }



  mapReportOptions() {
    let reportNavOptions = this.reportNavOptions;
    this.reportNavOptions = [];
    reportNavOptions.forEach(element => {
      if (!this.checkPermission(element.label)) {
        console.log(element)
        this.reportNavOptions.push(element);
      }
    });
    this.activatedRoute.url.subscribe((response) => {
      if (this.activatedRoute.snapshot.firstChild) {
        this.activeRoute = this.activatedRoute.snapshot.firstChild.routeConfig.path;
        // this.filterDates('current_week');
        this.getModuleType();
        this.filterDates(this.intervals[0].id);
      } else if (this.reportNavOptions.length > 0) {
        this.routeTo(this.reportNavOptions[0].routeTo, 0, this.reportNavOptions[0].label);
      }
    });
  }

  routeTo(routeTo: string, index: number, label: string) {
    if (routeTo.length) {
      this.route.navigate([routeTo]);
      this.activeRoute = routeTo.split('/')[routeTo.split('/').length - 1];
      this.SelectedRport = label;
      this.getModuleType();
      this.filterDates(this.intervalSelected.value);
    }
  }
  isActive(route, label) {
    if (route.indexOf(this.activeRoute) >= 0) {
      this.SelectedRport = label;
      return true;
    }
  }

  toggleSideNav() {
    this.showSidePanle = this.showSidePanle == true ? false : true;
  }
  openScheduleForm() {
    let response: any;
    let data = {
      title: 'Schedule Report',
      subtitle: this.SelectedRport,
    };
    this.dialog
      .open(ScheduleDialogComponent, {
        width: '800px',
        height: 'auto',
        data: data,
      })
      .afterClosed()
      .subscribe((data) => {
        //console.log(data);
      });
  }

  onChangeInterval(event) {
    console.log(event);
    if (event == 'custom') {
      let start_date = this.start_date.split('/');
      start_date = start_date[2] + '-' + start_date[1] + '-' + start_date[0];
      let end_date = this.end_date.split('/');
      end_date = end_date[2] + '-' + end_date[1] + '-' + end_date[0];
      let data: ReportCustomDateFilterModel = {
        title: 'Custom Filter',
        startdate: start_date,
        enddate: end_date,
        activeRoute: this.activeRoute
      };
      this.dialog
        .open(ReportCustomFilterComponent, {
          width: '800px',
          height: 'auto',
          data: data,
        })
        .afterClosed()
        .subscribe((data) => {
          if (data?.startdate !== undefined && data?.startdate !== "" && data?.enddate !== undefined && data?.enddate !== "") {
            let start_date = data.startdate.split('-');
            start_date = start_date[2] + '/' + start_date[1] + '/' + start_date[0];
            let end_date = data.enddate.split('-');
            end_date = end_date[2] + '/' + end_date[1] + '/' + end_date[0];
            this.start_date = start_date;
            this.end_date = end_date;
            this.getDatabyFilter();
          }
        });
    } else {
      this.filterDates(this.intervalSelected.value);
    }
  }

  onChangeCustomer(event) {
    this.filterDates(this.intervalSelected.value);

  }

  filterDates(type) {
    //console.log(type);
    let date = new Date();
    let quarter = Math.floor(date.getMonth() / 3);
    let start_date, end_date;
    switch (type) {
      case 'today':
        start_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        end_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        break;
      case 'current_week':
        start_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + (date.getDay() == 0 ? -6 : 1) - date.getDay()
        );
        end_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + (date.getDay() == 0 ? 0 : 7) - date.getDay()
        );
        break;
      case 'current_month':
        start_date = new Date(date.getFullYear(), date.getMonth(), 1);
        end_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        break;
      case 'current_quarter':
        start_date = new Date(date.getFullYear(), quarter * 3, 1);
        end_date = new Date(
          start_date.getFullYear(),
          start_date.getMonth() + 3,
          0
        );
        break;
      case 'current_year':
        start_date = new Date(date.getFullYear(), 0, 1);
        end_date = new Date(date.getFullYear(), 11, 31);
        break;
      case 'yesterday':
        start_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - 1
        );
        end_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - 1
        );
        break;
      case 'previous_week':
        let diffToMonday = date.getDate() - date.getDay();
        start_date = new Date(date.setDate(diffToMonday - 6));
        end_date = new Date(date.setDate(diffToMonday));
        break;
      case 'previous_month':
        start_date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        end_date = new Date(date.getFullYear(), date.getMonth(), 0);
        break;
      case 'previous_quarter':
        start_date = new Date(date.getFullYear(), quarter * 3 - 3, 1);
        end_date = new Date(
          start_date.getFullYear(),
          start_date.getMonth() + 3,
          0
        );
        break;
      case 'previous_year':
        start_date = new Date(date.getFullYear() - 1, 0, 1);
        end_date = new Date(date.getFullYear() - 1, 11, 31);
        break;
      default:
        start_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + (date.getDay() == 0 ? -6 : 1) - date.getDay()
        );
        end_date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + (date.getDay() == 0 ? 0 : 7) - date.getDay()
        );
        break;
    }

    this.start_date =
      start_date.getDate() +
      '/' +
      (start_date.getMonth() + 1) +
      '/' +
      start_date.getFullYear();
    this.end_date =
      end_date.getDate() +
      '/' +
      (end_date.getMonth() + 1) +
      '/' +
      end_date.getFullYear();

    this.runReport();
  }

  getDatabyFilter() {
    let start_date = this.start_date.split('/');
    start_date = start_date[2] + '-' + start_date[1] + '-' + start_date[0];
    let end_date = this.end_date.split('/');
    end_date = end_date[2] + '-' + end_date[1] + '-' + end_date[0];
    let sideFilter = this.sideFiltersForm.value;
    console.log(sideFilter);
    let body = {
      division: sideFilter.division.map(item => item.id) || [],
      region: sideFilter.region.map(item => item.id) || [],
      route: sideFilter.route.map(item => item.id) || [],
      supervisor: sideFilter.supervisor.map(item => item.id) || [],
      salesman: sideFilter.salesman.map(item => item.id) || [],
      start_date: start_date,
      customer_id: (this.activeRoute == 'store-summary' ? this.customerSelected.value : undefined),
      customer: this.customerSelected.value ? this.customerSelected.value : "",
      end_date: end_date,
      export: this.export,
      export_type: this.export_type,
      module: this.getModuleType(),
      item_category: sideFilter.item_category.map(item => item.id) || []
    };
    //console.log(body);
    if (body.module == "") return false;
    this.ReportService.getReportData(body).subscribe((res) => {
      if (res?.status == true) {
        this.selectedReportData = res.data;
        this.dataEditor.sendData({
          type: CompDataServiceType.REPORT_DATA,
          request: body,
          data: res.data,
        });
      }
    });
  }

  exportReport(type) {
    let start_date = this.start_date.split('/');
    start_date = start_date[2] + '-' + start_date[1] + '-' + start_date[0];
    let end_date = this.end_date.split('/');
    end_date = end_date[2] + '-' + end_date[1] + '-' + end_date[0];
    let sideFilter = this.sideFiltersForm.value;
    let body = {
      division: sideFilter.division[0]?.id || "",
      region: sideFilter.region[0]?.id || "",
      route: sideFilter.route[0]?.id || "",
      supervisor: sideFilter.supervisor[0]?.id || "",
      salesman: sideFilter.salesman[0]?.id || "",
      start_date: start_date,
      end_date: end_date,
      export: 1,
      export_type: type,
      module: this.getModuleType(),
    };
    //console.log(body);
    let filetype = 'file.' + type;
    this.ReportService.getReportData(body).subscribe((res) => {
      if (res?.status == true) {
        this.apiService.downloadFile(res.data.file_url, filetype);
      }
    });
  }

  getModuleType() {
    this.intervals = [
      { id: 'today', name: 'Today' },
      { id: 'current_week', name: 'This Week' },
      { id: 'current_month', name: 'This Month' },
      { id: 'current_quarter', name: 'This Quarter' },
      { id: 'current_year', name: 'This Year' },
      { id: 'yesterday', name: 'Yesterday' },
      { id: 'previous_week', name: 'Previous Week' },
      { id: 'previous_month', name: 'Previous Month' },
      { id: 'previous_quarter', name: 'Previous Quarter' },
      { id: 'previous_year', name: 'Previous Year' },
      { id: 'custom', name: 'Custom' },
    ];
    //console.log(this.activeRoute);
    let module = '';
    switch (this.activeRoute) {
      case 'competitor-product':
        module = 'merchandiser/competitor-info';
        break;
      case 'new-customer':
        module = 'merchandiser/new-customer';
        break;
      case 'closed-visits':
        module = 'merchandiser/close-visit';
        break;
      case 'order-sumamry':
        module = 'merchandiser/order-summary';
        break;
      case 'order-returns':
        module = 'merchandiser/order-return';
        break;
      case 'visit-summary':
        module = 'merchandiser/visit-summary';
        break;
      case 'photos':
        module = 'merchandiser/photos';
        break;
      case 'timesheets':
        module = 'merchandiser/time-sheet';
        break;
      case 'sos':
        module = 'merchandiser/sos';
        break;
      case 'stock-availability':
        module = 'merchandiser/stock-availability';
        break;
      case 'task-answers':
        module = 'merchandiser/task-answer';
        break;
      case 'task-summary':
        module = 'merchandiser/task-summary';
        break;
      case 'store-summary':
        module = 'merchandiser/store-summary';
        break;
      case 'jp-compliance':
        module = 'merchandiser/route-visit';
        break;
      case 'merchandiser-login-log':
        module = 'merchandiser/salesman-login-log';
        break;
      case 'load-sheet':
        module = 'load_sheet';
        break;
      case 'carry-over':
        module = 'carry_over_report';
        break;
      case 'order-reports':
        module = 'order';
        break;
      case 'customer-sales-per-month':
        module = 'sales_by_customer';
        break;
      case 'van-customer':
        module = 'van_customer_report';
        break;
      case 'daily-field-activity':
        module = 'daily_field_activity_report';
        break;
      case 'product-summary-by-customer-sales':
        module = 'product_summary_customer_sales';
        break;
      case 'visit-analysis-by-van-or-salesman':
        module = 'visit-analysis-van-salesman';
        this.intervals = [
          { id: 'current_week', name: 'This Week' },
          { id: 'previous_week', name: 'Previous Week' },
          { id: 'custom', name: 'Custom' },
        ];
        break;
      case 'sales-analysis':
        module = 'sales_analysis';
        break;
      case 'customer-statement':
        // module = 'customer_statement';
        module = 'merchandiser/balance-sheet';
        break;
      case 'periodic-wise-collection':
        module = 'payment_received';
        break;
      case 'sales-quantity-analysis':
        module = 'salse_quantity_analysis';
        break;
      case 'monthly-ageing':
        module = 'customer_payment_report';
        this.intervals = [
          { id: 'current_month', name: 'This Month' },
          { id: 'current_quarter', name: 'This Quarter' },
          { id: 'current_year', name: 'This Year' },
          { id: 'previous_month', name: 'Previous Month' },
          { id: 'previous_quarter', name: 'Previous Quarter' },
          { id: 'previous_year', name: 'Previous Year' },
          { id: 'custom', name: 'Custom' },
        ];
        if (this.intervalSelected.value == 'today' || this.intervalSelected.value == 'current_week' || this.intervalSelected.value == 'previous_week' || this.intervalSelected.value == 'yesterday') {
          this.intervalSelected.setValue('current_month');
        }
        break;
      case 'trip-execution':
        module = 'salseman_trip_report';
        break;
      case 'end-inventory':
        module = 'unload_report';
        break;
    }
    return module;
  }

  checkPermission(value) {
    if (!this.checkDomain()) return false;
    let data: any = localStorage.getItem('permissions');
    let userPermissions = [];
    if (!data) return true;
    data = JSON.parse(data);

    let module = data.find((x) => x.moduleName === value);
    if (!module) {
      userPermissions = [];
      return true;
    }
    userPermissions = module.permissions.map((permission) => {
      const name = permission.name.split('-').pop();
      return { name };
    });
    const isView = userPermissions.find((x) => x.name == 'list');
    return isView ? false : true;
  }

  checkDomain() {
    if (
      this.domain.split(':')[0] == 'localhost' ||
      this.domain.split('.')[0] == 'mobiato-msfa'
    ) {
      return false;
    }
    return true;
  }


}
