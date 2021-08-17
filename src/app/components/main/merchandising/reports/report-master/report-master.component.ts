import { MerchandisingService } from './../../merchandising.service';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { MatDialog } from '@angular/material/dialog';
import { DataEditor } from 'src/app/services/data-editor.service';
import { ScheduleDialogComponent } from './../../../../dialogs/schedule-dialog/schedule-dialog.component';
import { ReportCustomFilterComponent } from './../../../../dialogs/report-custom-filter/report-custom-filter.component';
import { CompDataServiceType } from 'src/app/services/constants';

@Component({
  selector: 'app-report-master',
  templateUrl: './report-master.component.html',
  styleUrls: ['./report-master.component.scss'],
})
export class ReportMasterComponent extends BaseComponent implements OnInit {
  public reportNavOptions: any[] = [];
  public activeRoute: string;
  public SelectedRport: string;
  public intervalSelected: FormControl;
  public customerSelected: FormControl;
  public showSidePanle = false;
  public selectedReportData = [];
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
  selectedPopover: string;
  start_date: any;
  end_date: any;
  export_type = '';
  export = 0;
  module_name = '';

  constructor(
    private route: Router,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public dataEditor: DataEditor,
    public merService: MerchandisingService,
  ) {
    super('reports');
  }

  ngOnInit(): void {
    const sidebarContainer = document.querySelector('._sidenav');
    sidebarContainer.classList.toggle('collapse_sidenav');
    // this.apiService
    //   .getCustomers().subscribe((res) => {
    //     this.customers = res.data;
    //   });
    this.apiService.getMasterDataLists().subscribe((result: any) => {
      this.customers = result.data.customers;
    })
    this.intervalSelected = new FormControl('current_week');
    this.customerSelected = new FormControl('');

    this.reportNavOptions = JSON.parse(localStorage.getItem('reportbar'));

    if (!this.reportNavOptions) {
      this.apiService.getReportNavOptions().subscribe((res: any[]) => {
        this.reportNavOptions = res;
        this.mapReportOptions();
        localStorage.setItem('reportbar', JSON.stringify(res));
      });
    } else {
      this.mapReportOptions();
    }
  }

  mapReportOptions() {
    let reportNavOptions = this.reportNavOptions;
    this.reportNavOptions = [];
    reportNavOptions.forEach(element => {
      if (!this.checkPermission(element.label)) {
        this.reportNavOptions.push(element);
      }
    });
    this.activatedRoute.url.subscribe((response) => {
      if (this.activatedRoute.snapshot.firstChild) {
        this.activeRoute = this.activatedRoute.snapshot.firstChild.routeConfig.path;
        this.filterDates('current_week');
      } else {
        this.routeTo(this.reportNavOptions[0].routeTo, 0, this.reportNavOptions[0].label);
      }
    });
  }

  routeTo(routeTo: string, index: number, label: string) {
    if (routeTo.length) {
      this.route.navigate([routeTo]);
      this.activeRoute = routeTo.split('/')[routeTo.split('/').length - 1];
      this.SelectedRport = label;
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
      let data = {
        title: 'Custom Filter',
        startdate: start_date,
        enddate: end_date,
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
    this.getDatabyFilter();
  }

  getDatabyFilter() {
    let start_date = this.start_date.split('/');
    start_date = start_date[2] + '-' + start_date[1] + '-' + start_date[0];
    let end_date = this.end_date.split('/');
    end_date = end_date[2] + '-' + end_date[1] + '-' + end_date[0];
    let body = {
      start_date: start_date,
      customer_id: (this.activeRoute == 'store-summary' ? this.customerSelected.value : undefined),
      end_date: end_date,
      export: this.export,
      export_type: this.export_type,
      module: this.getModuleType(),
    };
    //console.log(body);
    this.merService.getReportData(body).subscribe((res) => {
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
    let body = {
      start_date: start_date,
      end_date: end_date,
      export: 1,
      export_type: type,
      module: this.getModuleType(),
    };
    //console.log(body);
    let filetype = 'file.' + type;
    this.merService.getReportData(body).subscribe((res) => {
      if (res?.status == true) {
        this.apiService.downloadFile(res.data.file_url, filetype);
      }
    });
  }

  getModuleType() {
    //console.log(this.activeRoute);
    let module = '';
    switch (this.activeRoute) {
      case 'competitor-product':
        module = 'competitor-info';
        break;
      case 'new-customer':
        module = 'new-customer';
        break;
      case 'closed-visits':
        module = 'close-visit';
        break;
      case 'order-sumamry':
        module = 'order-summary';
        break;
      case 'order-returns':
        module = 'order-return';
        break;
      case 'visit-summary':
        module = 'visit-summary';
        break;
      case 'photos':
        module = 'photos';
        break;
      case 'timesheets':
        module = 'time-sheet';
        break;
      case 'sos':
        module = 'sos';
        break;
      case 'stock-availability':
        module = 'stock-availability';
        break;
      case 'task-answers':
        module = 'task-answer';
        break;
      case 'task-summary':
        module = 'task-summary';
        break;
      case 'store-summary':
        module = 'store-summary';
        break;
      case 'jp-compliance':
        module = 'route-visit';
        break;
      case 'merchandiser-login-log':
        module = 'salesman-login-log';
        break;
    }
    return module;
  }

  checkPermission(value) {
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
}
