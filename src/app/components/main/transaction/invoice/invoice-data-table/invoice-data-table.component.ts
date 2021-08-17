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
import { InvoiceModel } from '../invoice-models';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import {
  OrderUpdateProcessColor,
  OrderUpdateProcess,
} from 'src/app/components/main/transaction/orders/order-models';
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
import { InvoiceServices } from '../invoice.service';
import { Events } from 'src/app/models/events.model';
import { EventBusService } from 'src/app/services/event-bus.service';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TemplateRef } from '@angular/core';
@Component({
  selector: 'app-invoice-data-table',
  templateUrl: './invoice-data-table.component.html',
  styleUrls: ['./invoice-data-table.component.scss'],
})
export class InvoiceDataTableComponent implements OnInit, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;
  @Input() public newInvoiceData: any;
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  public dataSource: MatTableDataSource<InvoiceModel>;
  public filterObjectId: any = null;
  public invoiceData: InvoiceModel[] = [];
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
  selectedColumnFilter: string;
  filterForm: FormGroup;

  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'misc', title: 'Invoices', show: false },
    { def: 'date', title: 'Date', show: true },
    { def: 'code', title: 'Invoice#', show: true },
    { def: 'customer_code', title: 'Customer Code#', show: true },
    { def: 'name', title: 'Customer Name', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'route_name', title: 'Route Name', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    { def: 'salesman_name', title: 'Salesman Name', show: true },
    { def: 'due', title: 'Due Date', show: true },
    { def: 'amount', title: 'Amount', show: true },
    { def: 'approval', title: 'Approval', show: true },
    { def: 'status', title: 'Status', show: true },
    { def: 'payment_status', title: 'Payment Status', show: true },
    { def: 'ERP_status', title: 'Odoo Status', show: true },
  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'expand', title: 'Detail', show: true },
  ];

  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  @ViewChild("dialogRef") dialogRef: TemplateRef<any>;
  isOdooMessageOpen: boolean = false;
  constructor(
    public apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    private eventService: EventBusService,
    private deleteDialog: MatDialog,
    private invoiceServices: InvoiceServices,
    router: Router,
    public fb: FormBuilder,
    private routerParam: ActivatedRoute
  ) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog, router });
    this.dataSource = new MatTableDataSource<InvoiceModel>();
  }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      invoice_date: [''],
      invoice_number: [''],
      invoice_due_date: [''],
      customer_name: [''],
      status: [''],
      customer_code: [''],
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

    this.getInvoiceList();

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.GET_NEW_DATA) {
          this.filterObjectId = value.data.id;
          this.getInvoiceList();
        }
        if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.closeDetailView();
        }
        if (value.uuid) {
          const clone = JSON.parse(JSON.stringify(this.invoiceData));
          const index = clone.findIndex((x) => x.uuid === value.uuid);
          if (index > -1) {
            clone.splice(index, 1);
            this.invoiceData = clone;
            this.dataSource.data = clone;
          }
        }
      })
    );

    this.subscriptions.push(
      this.eventService.on(Events.SEARCH_INVOICE, (data) => {
        this.dataSource = new MatTableDataSource<InvoiceModel>(data);
        this.dataSource.paginator = this.paginator;
      })
    );
    this.checkInvoiceParamUuid();
  }

  checkInvoiceParamUuid() {
    this.routerParam.queryParams.subscribe(res => {
      this.isDetailVisible = false;
      let uuid = res["uuid"];
      if (uuid) {
        this.detailsClosed.emit();
        this.closeDetailView();
        this.invoiceServices.getInvoiceByID(uuid).subscribe((res) => {
          var dataObj = res.data;
          this.openDetailView(dataObj);
        })
      }
    });
  }

  getInvoiceList() {
    this.subscriptions.push(
      this.invoiceServices
        .getInvoiceList(this.filterForm.value)
        // .getInvoiceList(this.page, this.pageSize)
        // .pipe(
        //   map((result) => {
        //     return result;
        //   })
        // )
        .subscribe((result) => {
          this.invoiceData = result.data;
          this.apiResponse = result;
          this.allResData = result.data;
          this.dataSource = new MatTableDataSource<InvoiceModel>(
            this.invoiceData
          );
          if (this.filterObjectId != null) {
            let filterData = result.data.find(x => x.id === this.filterObjectId);
            if (filterData) {
              this.openDetailView(filterData)
            }
            this.filterObjectId = null;
          };
          // this.dataSource.paginator = this.paginator;
        })
    );
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getInvoiceList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newInvoiceData &&
        Object.keys(changes.newInvoiceData.currentValue).length > 0
      ) {
        let currentValue = changes.newInvoiceData.currentValue;
        this.newInvoiceData = currentValue;
        this.updateAllData(this.newInvoiceData);
      }
    }
  }

  updateAllData(data) {
    this.getInvoiceList();
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

  public openDetailView(data: InvoiceModel): void {
    if (this.isOdooMessageOpen) {
      return;
    }
    this.isDetailVisible = true;
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



  onColumnFilterOpen(item) {
    console.log(item);
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.getInvoiceList();
  }
  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }

  public checkboxLabel(row?: InvoiceModel): string {
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
  getPaymentStatus(status: any) {

    let paymentStatus: string;
    const grandTotal = Number(status.grand_total);
    const pendingTotal = Number(status.pending_credit);

    if (pendingTotal === 0) {
      paymentStatus = "Paid"
    }

    else if (grandTotal == pendingTotal) {
      paymentStatus = "Un-Paid"
    }
    else if (pendingTotal < grandTotal) {
      paymentStatus = "Partial-Paid"
    }
    return paymentStatus;
  }

  getOrderStatus(status: any) {
    let ordStatus = {
      color: OrderUpdateProcessColor.Pending,
      label: status,
    };
    switch (status) {
      case OrderUpdateProcess.Approved:
        ordStatus = {
          color: OrderUpdateProcessColor.Approved,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.Pending:
        ordStatus = {
          color: OrderUpdateProcessColor.Pending,
          label: status,
        };
        this.orderStatus = ordStatus;
        break;
      case OrderUpdateProcess.PartialInvoice:
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
      case OrderUpdateProcess.Invoiced:
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

  filterOdooMessageData(data: any) {
    try {
      this.isOdooMessageOpen = false;
      if (data) {
        var obj: any = JSON.parse(data);
        if (obj.data)
          this.deleteDialog.open(this.dialogRef, { data: obj.data.message });

        if (obj.response) {
          var text = "";
          obj.response.forEach(element => {
            element.products.forEach(product => {
              text = `${text} ${product},`
            });
          });
          this.deleteDialog.open(this.dialogRef, { data: text });

        }
      }

    } catch (e) {
      data = data.replace(/\\/g, "");
      var obj: any = JSON.parse(data);
      if (obj.response) {
        var text = "";
        obj.response.forEach(element => {
          element.products.forEach(product => {
            text = `${text} ${product},`
          });
        });
        this.deleteDialog.open(this.dialogRef, { data: text });

      }
    }
  }

  postOdoo(invoiceData) {
    this.apiService.postInvoiceOdooData(invoiceData.uuid).subscribe(res => {
      this.getInvoiceList();

    });
  }
}
