import { CreditNoteService } from './../credit-note.service';
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
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import {
  OrderModel,
  ApiOrderModel,
  apiOrderMapper,
} from 'src/app/components/main/transaction/orders/order-models';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { Utils } from 'src/app/services/utils';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { CollectionModel } from '../../collection/collection-models';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import {
  OrderUpdateProcess,
  OrderUpdateProcessColor,
} from '../../orders/order-models';
import { TemplateRef } from '@angular/core';
@Component({
  selector: 'app-credit-note-data-table',
  templateUrl: './credit-note-data-table.component.html',
  styleUrls: ['./credit-note-data-table.component.scss'],
})
export class CreditNoteDataTableComponent implements OnInit, OnDestroy {
  @Input() public isDetailVisible: boolean;
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newCreditData: any;
  public dataSource: MatTableDataSource<OrderModel>;
  public filterObjectId: any = null;
  public orders: OrderModel[] = [];
  advanceSearchRequest: any[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public allResData = [];
  public creditStatus = {
    color: '',
    label: '',
  };
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0,
    },
  };
  page = 1;
  selectedColumnFilter: string;

  pageSize = PAGE_SIZE_10;
  private router: Router;
  private creditNoteService: CreditNoteService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'misc', title: 'Orders', show: false },
    { def: 'date', title: 'Credit Note Date', show: true },
    { def: 'code', title: 'Code', show: true },
    { def: 'customerCode', title: 'Customer Code', show: true },
    { def: 'name', title: 'Customer', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'route_name', title: 'Route Name', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    { def: 'salesman_name', title: 'Salesman Name', show: true },
    { def: 'amount', title: 'Credit Amount', show: true },
    { def: 'approval', title: 'Approval', show: true },
    { def: 'status', title: 'Status', show: true },
    { def: 'ERP_status', title: 'Odoo Status', show: true },

  ];
  private collapsedColumns: ColumnConfig[] = [
    { def: 'expand', title: 'Detail', show: true },
  ];
  requestOriginal;
  filterForm: FormGroup;
  @ViewChild("dialogRef") dialogRef: TemplateRef<any>;
  isOdooMessageOpen: boolean = false;
  constructor(
    public apiService: ApiService,
    creditNoteService: CreditNoteService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    private deleteDialog: MatDialog,
    public fb: FormBuilder,
    private eventService: EventBusService,
    router: Router,
    private routerParam: ActivatedRoute
  ) {
    Object.assign(this, {
      creditNoteService,
      dataEditor,
      fds,
      deleteDialog,
      router,
    });
    this.dataSource = new MatTableDataSource<OrderModel>();
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
    this.getCreditNotes();
  }
  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      credit_note_number: [''],
      current_stage: [''],
      customer_name: [''],
      customer_code: [''],
      route_code: [''],
      route_name: [''],
      salesman_code: [''],
      salesman_name: [''],
      page: [this.page],
      page_size: [this.pageSize],
      approval: ['']
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...[...this.allColumns].splice(2)];
    this.getCreditNotes();
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.GET_NEW_DATA) {
          this.filterObjectId = value.data.id;
          this.getCreditNotes();
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
      this.eventService.on(Events.SEARCH_CREDIT_NOTE, ({ request, requestOriginal, response }) => {
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
    this.checkCreditNoteParamUuid();
  }

  checkCreditNoteParamUuid() {
    this.routerParam.queryParams.subscribe(res => {
      this.isDetailVisible = false;
      let uuid = res["uuid"];
      if (uuid) {
        this.detailsClosed.emit();
        this.closeDetailView();
        this.creditNoteService.getCreditNoteByKey(uuid).subscribe((res) => {
          var dataObj = res.data;
          this.openDetailView(dataObj);
        })
      }
    });
  }
  onCloseCriteria() {
    this.advanceSearchRequest = []
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { reset: true, module: Events.SEARCH_CREDIT_NOTE, route: '/transaction/credit-note' }));
  }
  onChangeCriteria() {
    this.eventService.emit(new EmitEvent(Events.CHANGE_CRITERIA, { route: '/transaction/credit-note' }));
  }

  getCreditNotes() {
    if (this.advanceSearchRequest.length > 0) {
      let requestOriginal = this.requestOriginal;
      requestOriginal['page'] = this.page;
      requestOriginal['page_size'] = this.pageSize;
      this.subscriptions.push(
        this.apiService.onSearch(requestOriginal).subscribe((res) => {
          this.apiResponse = res;
          this.allResData = res.data;
          this.updateDataSource(res.data);
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
      this.creditNoteService
        .getCreditNotes(this.filterForm.value)
        .subscribe((result) => {
          this.orders = result.data;
          this.apiResponse = result;
          this.allResData = result.data;
          this.dataSource = new MatTableDataSource<OrderModel>(this.orders);
          // this.dataSource.paginator = this.paginator;
        })
    );
  };

  // getCreditStatus(status: any) {
  //   let ordStatus = {
  //     color: OrderUpdateProcessColor.Pending,
  //     label: status,
  //   };
  //   switch (status) {
  //     case OrderUpdateProcess.Pending:
  //       ordStatus = {
  //         color: OrderUpdateProcessColor.Pending,
  //         label: status,
  //       };
  //       this.creditStatus = ordStatus;
  //       break;
  //     case OrderUpdateProcess.PartialDeliver:
  //       ordStatus = {
  //         color: OrderUpdateProcessColor.PartialDeliver,
  //         label: status,
  //       };
  //       this.creditStatus = ordStatus;
  //       break;
  //     case OrderUpdateProcess.InProcess:
  //       ordStatus = {
  //         color: OrderUpdateProcessColor.InProcess,
  //         label: status,
  //       };
  //       this.creditStatus = ordStatus;
  //       break;
  //     case OrderUpdateProcess.Accept:
  //       ordStatus = {
  //         color: OrderUpdateProcessColor.Accept,
  //         label: status,
  //       };
  //       this.creditStatus = ordStatus;
  //       break;
  //     case OrderUpdateProcess.Delivered:
  //       ordStatus = {
  //         color: OrderUpdateProcessColor.Delivered,
  //         label: status,
  //       };
  //       this.creditStatus = ordStatus;
  //       break;
  //     case OrderUpdateProcess.Completed:
  //       ordStatus = {
  //         color: OrderUpdateProcessColor.Completed,
  //         label: status,
  //       };
  //       this.creditStatus = ordStatus;
  //       break;
  //     case OrderUpdateProcess.Approved:
  //       ordStatus = {
  //         color: OrderUpdateProcessColor.Approved,
  //         label: status,
  //       };
  //       this.creditStatus = ordStatus;
  //       break;
  //     case OrderUpdateProcess.Cancel:
  //       ordStatus = {
  //         color: OrderUpdateProcessColor.Cancel,
  //         label: status,
  //       };
  //       this.creditStatus = ordStatus;
  //       break;
  //     case OrderUpdateProcess.Rejected:
  //       ordStatus = {
  //         color: OrderUpdateProcessColor.Rejected,
  //         label: status,
  //       };
  //       this.creditStatus = ordStatus;
  //       break;
  //   }
  // }

  // getCreditStatusValue(status: any) {
  //   this.getCreditStatus(status);
  //   return this.creditStatus.label;
  // }

  // orderCreditColor(status: any) {
  //   this.getCreditStatus(status);
  //   return this.creditStatus.color;
  // }


  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getCreditNotes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (
        changes.newCreditData &&
        Object.keys(changes.newCreditData.currentValue).length > 0
      ) {
        let currentValue = changes.newCreditData.currentValue;
        this.newCreditData = currentValue;
        this.updateAllData(this.newCreditData);
      }
    }
  }

  updateAllData(data) {
    this.getCreditNotes();
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

  public closeDetailView(): void {
    this.isDetailVisible = false;

    this.updateCollapsedColumns();
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns
      .filter((column) => column.show)
      .map((column) => column.def);
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected()
      ? this.selections.clear()
      : this.dataSource.data.forEach((row) => this.selections.select(row));
  }
  public openDetailView(data: any): void {
    if (this.isOdooMessageOpen) {
      return;
    }
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
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

  postOdoo(creditNoteData) {
    this.apiService.postCreditNoteOdooData(creditNoteData.uuid).subscribe(res => {
      this.getCreditNotes();
    });
  }
}
