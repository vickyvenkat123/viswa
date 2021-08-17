import { ApiService } from 'src/app/services/api.service';
import { getCurrency, getCurrencyDecimalFormat } from './../../../../../services/constants';
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
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeliveryModel } from '../delivery-model';
import {
  OrderUpdateProcessColor,
  OrderUpdateProcess,
} from 'src/app/components/main/transaction/orders/order-models';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import {
  APP_CURRENCY_CODE,
  APP_CURRENCY_DECIMAL_FORMAT,
  CompDataServiceType,
} from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { DeliveryService } from '../delivery.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { Events } from 'src/app/models/events.model';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-delivery-data-table',
  templateUrl: './delivery-data-table.component.html',
  styleUrls: ['./delivery-data-table.component.scss'],
})
export class DeliveryDataTableComponent implements OnInit, OnDestroy {
  @Input() public isDetailVisible: boolean;
  @Input() public newDeliveryData: any;
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  public dataSource: MatTableDataSource<DeliveryModel>;
  public filterObjectId: any = null;
  public deliveryData: DeliveryModel[] = [];
  public customerData: any[] = [];

  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
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
  selectedColumnFilter: string;
  filterForm: FormGroup;
  private router: Router;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'misc', title: 'Deliveries', show: false },
    { def: 'date', title: 'Date', show: true },
    { def: 'code', title: 'Delivery Number', show: true },
    { def: 'customer_code', title: 'Customer Code', show: true },
    { def: 'name', title: 'Customer Name', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'route_name', title: 'Route Name', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    { def: 'salesman_name', title: 'Salesman Name', show: true },
    { def: 'due', title: 'Delivery Date', show: true },
    { def: 'amount', title: 'Amount', show: true },
    { def: 'approval', title: 'Approval', show: true },
    { def: 'status', title: 'Status', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'expand', title: 'Expand', show: true },
  ];

  constructor(
    private deliveryService: DeliveryService,
    public apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog,
    private eventService: EventBusService,
    router: Router,
    public fb: FormBuilder,
    private routerParam: ActivatedRoute
  ) {
    Object.assign(this, { dataEditor, fds, deleteDialog, router });
    this.dataSource = new MatTableDataSource<DeliveryModel>();
  }

  public ngOnInit(): void {
    //console.log(getCurrencyDecimalFormat());
    this.filterForm = this.fb.group({
      date: [''],
      customer_name: [''],
      customer_code: [''],
      code: [''],
      route_code: [''],
      route_name: [''],
      salesman_code: [''],
      salesman_name: [''],
      delivery_date: [''],
      status: [''],
      page: [this.page],
      page_size: [this.pageSize],
      approval: [''],
      current_stage: [''],
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...[...this.allColumns].splice(2)];
    this.getDeliveryList();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.GET_NEW_DATA) {
          this.filterObjectId = value.data.id;
          console.log(value);
          this.getDeliveryList();
        }
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
        if (value.uuid) {
          const clone = JSON.parse(JSON.stringify(this.deliveryData));
          const index = clone.findIndex((x) => x.uuid === value.uuid);
          if (index > -1) {
            clone.splice(index, 1);
            this.deliveryData = clone;
            this.dataSource.data = clone;
          }
        }
      })
    );

    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_DELIVERY, (data) => {
        this.dataSource = new MatTableDataSource<DeliveryModel>(data);
        // this.dataSource.paginator = this.paginator;
      })
    );

    this.checkDeliveryeParamUuid();
  }

  checkDeliveryeParamUuid() {
    this.routerParam.queryParams.subscribe(res => {
      this.isDetailVisible = false;
      let uuid = res["uuid"];
      if (uuid) {
        this.detailsClosed.emit();
        this.closeDetailView();
        this.deliveryService.getDeliveryListById(uuid).subscribe((res) => {
          var dataObj = res.data;
          this.openDetailView(dataObj);
        })
      }
    });
  }

  getDeliveryList() {
    this.subscriptions.push(
      this.deliveryService
        .getDeliveryList(this.filterForm.value)
        .subscribe((result) => {
          this.deliveryData = result.data;
          this.apiResponse = result;
          this.allResData = result.data;
          this.dataSource = new MatTableDataSource<DeliveryModel>(
            this.deliveryData
          );
          if (this.filterObjectId != null) {
            let filterData = result.data.find(x => x.id === this.filterObjectId);
            if (filterData) {
              this.openDetailView(filterData);
            }
            this.filterObjectId = null;
          };
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
    this.getDeliveryList();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.isDetailVisible, changes);
    if (changes) {
      if (
        changes.newDeliveryData &&
        Object.keys(changes.newDeliveryData.currentValue).length > 0
      ) {
        let currentValue = changes.newDeliveryData.currentValue;
        this.isDetailVisible = true;
        console.log(this.isDetailVisible);
        this.newDeliveryData = currentValue;
        this.updateAllData(this.newDeliveryData);
      }
    }
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  updateAllData(data) {
    this.getDeliveryList();
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

  public openDetailView(data: DeliveryModel): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
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
    this.getDeliveryList();
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

  public checkboxLabel(row?: DeliveryModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  private updateCollapsedColumns(): void {
    console.log(this.isDetailVisible);
    this.displayedColumns = this.isDetailVisible
      ? this.collapsedColumns
      : this.allColumns;
    console.log(this.displayedColumns);
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
      case OrderUpdateProcess.Approved:
        ordStatus = {
          color: OrderUpdateProcessColor.Approved,
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
      case OrderUpdateProcess.PartialInvoice:
        ordStatus = {
          color: OrderUpdateProcessColor.PartialInvoice,
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
      case OrderUpdateProcess.Invoiced:
        ordStatus = {
          color: OrderUpdateProcessColor.Invoiced,
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
