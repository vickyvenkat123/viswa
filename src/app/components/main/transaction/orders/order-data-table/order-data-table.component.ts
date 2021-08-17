import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import {
  OrderModel,
  ApiOrderModel,
  apiOrderMapper,
  OrderUpdateProcess,
  OrderUpdateProcessColor,
} from '../order-models';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { OrderService } from '../order.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { DeliveryModel } from '../../delivery/delivery-model';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-order-data-table',
  templateUrl: './order-data-table.component.html',
  styleUrls: ['./order-data-table.component.scss'],
})
export class OrderDataTableComponent implements OnInit, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newOrderData: any = {};
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  public allResData = [];
  selectedColumnFilter: string;

  advanceSearchRequest: any[] = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  public dataSource: MatTableDataSource<OrderModel>;
  public filterObjectId: any = null;
  public orders: OrderModel[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public orderStatus = {
    color: '',
    label: '',
  };
  private router: Router;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'date', title: 'Date', show: true },
    { def: 'code', title: 'Order Number', show: true },
    { def: 'customer_code', title: 'Customer Code', show: true },
    { def: 'name', title: 'Customer Name', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'route_name', title: 'Route Name', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    { def: 'salesman_name', title: 'Salesman Name', show: true },
    { def: 'due', title: 'Due Date', show: true },
    { def: 'amount', title: 'Amount', show: true },
    { def: 'approval', title: 'Approval', show: true },
    { def: 'status', title: 'Status', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'expand', title: 'Detail', show: true },
  ];
  requestOriginal;
  filterForm: FormGroup;
  constructor(
    private orderService: OrderService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public fb: FormBuilder,
    private eventService: EventBusService,
    private routerParam: ActivatedRoute,
    fds: FormDrawerService,
    deleteDialog: MatDialog,
    router: Router
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog, router });
    this.dataSource = new MatTableDataSource<OrderModel>();
  }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      order_number: [''],
      customer_code: [''],
      date: [''],
      due_date: [''],
      current_stage: [''],
      customer_name: [''],
      route_code: [''],
      route_name: [''],
      salesman_code: [''],
      salesman: [''],
      page: [this.page],
      page_size: [this.pageSize],
      approval: ['']
    })


    this.displayedColumns = this.allColumns;
    this.filterColumns = [...[...this.allColumns].splice(2)];
    this.getAllOrdersList();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.GET_NEW_DATA) {
          this.filterObjectId = value.data.id;
          this.getAllOrdersList();
          if (this.isDetailVisible) {
            let data = this.dataSource.data.find((element: any) => element.id == value.data.id)
            console.log('Approved Data', data);
            this.openDetailView(data);
          }
        }
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
        if (value.uuid) {
          const clone = JSON.parse(JSON.stringify(this.orders));
          const index = clone.findIndex((x) => x.uuid === value.uuid);
          if (index > -1) {
            clone.splice(index, 1);
            this.orders = clone;
            this.dataSource.data = clone;
          }
        }
      })
    );

    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_ORDER, ({ request, requestOriginal, response }) => {
        this.advanceSearchRequest = [];
        this.requestOriginal = requestOriginal;
        if (request) {
          Object.keys(request).forEach(item => {
            this.advanceSearchRequest.push({ param: item, value: request[item] })
          })
        }
        this.apiResponse = response;
        this.allResData = response.data;
        this.updateDataSource(response.data);
      })
    );
    this.checkOrderParamUuid();
  }

  checkOrderParamUuid() {
    this.routerParam.queryParams.subscribe(res => {
      this.isDetailVisible = false;
      let uuid = res["uuid"];
      if (uuid) {
        this.detailsClosed.emit();
        this.closeDetailView();
        this.orderService.getOrderById(uuid).subscribe((res) => {
          var dataObj = res.data;
          this.openDetailView(dataObj);
        })
      }
    });
  }

  onCloseCriteria() {
    this.advanceSearchRequest = []
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_ORDER, route: '/transaction/order' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/transaction/order' }));
  }

  getAllOrdersList() {
    if (this.advanceSearchRequest.length > 0) {
      let requestOriginal = this.requestOriginal;
      requestOriginal['page'] = this.page;
      requestOriginal['page_size'] = this.pageSize;
      this.subscriptions.push(
        this.apiService.onSearch(requestOriginal).subscribe((res) => {
          this.apiResponse = res;
          this.allResData = res.data;
          this.dataSource = new MatTableDataSource<any>(res.data);
          if (this.filterObjectId != null) {
            let filterData = res.data.find(x => x.id === this.filterObjectId);
            this.openDetailView(filterData)
            this.filterObjectId = null;
          };
        })
      );
      return false;
    }
    this.subscriptions.push(
      this.orderService
        .orderList(this.filterForm.value)
        .subscribe((result) => {
          this.orders = result.data;
          this.apiResponse = result;
          this.allResData = result.data;
          this.dataSource = new MatTableDataSource<OrderModel>(this.orders);
          // this.dataSource.paginator = this.paginator;
        })
    );
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getAllOrdersList();
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.getAllOrdersList();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newOrderData &&
        Object.keys(changes.newOrderData.currentValue).length > 0
      ) {
        let currentValue = changes.newOrderData.currentValue;
        this.newOrderData = currentValue;
        this.updateAllData(this.newOrderData);
      }
    }
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  updateAllData(data) {
    this.getAllOrdersList();
    this.selections = new SelectionModel(true, []);
    if (data.delete !== undefined && data.delete == true) {
      this.closeDetailView();
    }
    return false;
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: OrderModel): void {
    this.isDetailVisible = true;
    console.log('open Detail Data', data)
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }

  public checkboxLabel(row?: OrderModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible
      ? this.collapsedColumns
      : this.allColumns;
  }

  getOrderStatus(status: any) {
    let ordStatus = {
      color: OrderUpdateProcessColor.Pending,
      label: status,
    };
    switch (status) {
      case OrderUpdateProcess.Pending:
        ordStatus = {
          color: OrderUpdateProcessColor.Pending,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.PartialDeliver:
        ordStatus = {
          color: OrderUpdateProcessColor.PartialDeliver,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.InProcess:
        ordStatus = {
          color: OrderUpdateProcessColor.InProcess,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Accept:
        ordStatus = {
          color: OrderUpdateProcessColor.Accept,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Delivered:
        ordStatus = {
          color: OrderUpdateProcessColor.Delivered,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Completed:
        ordStatus = {
          color: OrderUpdateProcessColor.Completed,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Approved:
        ordStatus = {
          color: OrderUpdateProcessColor.Approved,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Cancel:
        ordStatus = {
          color: OrderUpdateProcessColor.Cancel,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Rejected:
        ordStatus = {
          color: OrderUpdateProcessColor.Rejected,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
    }
  }

  getOrderStatusValue(status: any) {
    this.getOrderStatus(status);
    return this.orderStatus.label;
  }

  orderStatusColor(status: any) {
    this.getOrderStatus(status);
    return this.orderStatus.color;
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
