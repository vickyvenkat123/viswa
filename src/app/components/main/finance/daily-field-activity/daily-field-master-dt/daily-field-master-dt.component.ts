import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Utils } from 'src/app/services/utils';
import { CompDataServiceType } from 'src/app/services/constants';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-daily-field-master-dt',
  templateUrl: './daily-field-master-dt.component.html',
  styleUrls: ['./daily-field-master-dt.component.scss']
})
export class DailyFieldMasterDtComponent implements OnInit {

  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedRows: EventEmitter<any> = new EventEmitter<any>();
  @Input() public newCRData: any;
  @Input() public isDetailVisible: boolean;
  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];
  selectedColumnFilter: string;


  private allColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'created', title: 'Created Date', show: true },
    { def: 'super', title: 'Supervisor', show: true },
    { def: 'division', title: 'Division', show: true },
    { def: 'route_name', title: 'Route Name', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
    { def: 'action', title: 'Action', show: true }

  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'select', title: 'Select', show: true },
    { def: 'created', title: 'Created Date', show: true },
    { def: 'super', title: 'Supervisor', show: true },
  ];
  filterForm: FormGroup;
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  constructor(public apiService: ApiService, public fb: FormBuilder) {
    this.dataSource = new MatTableDataSource<any>();
  }

  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      supervisor: [''],
      date: [''],
      division: [''],
      route_name: [''],
      route_code: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);
    this.getToDoList();


    // this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
    //   if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
    //     this.closeDetailView();
    //   }
    // }));
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.filterForm.patchValue({
      page: this.page,
      page_size: this.pageSize
    });
    this.getToDoList();
  }

  getToDoList() {
    this.apiService.getDailyActivityList().subscribe((res) => {
      this.dataSource = new MatTableDataSource<any>(res.data);
    })
  }

  public getSelectedRows() {
    this.selectedRows.emit(this.selections.selected);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.newCRData && Object.keys(changes.newCRData.currentValue).length > 0) {
        let currentValue = changes.newCRData.currentValue;
        this.newCRData = currentValue;
        this.updateAllData(this.newCRData);
      }
    }
  }

  updateAllData(data) {
    this.getToDoList();
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

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data): void {
    // this.isDetailVisible = true;
    // this.itemClicked.emit(data);
    // this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }

  public getDisplayedColumns(): string[] {
    return this.displayedColumns.filter(column => column.show).map(column => column.def);
  }

  public isAllSelected(): boolean {
    return this.selections.selected.length === this.dataSource.data.length;
  }

  public toggleSelection(): void {
    this.isAllSelected() ? this.selections.clear() : this.dataSource.data.forEach(row => this.selections.select(row));
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {
    if (!item) {
      // Find the selected control and reset its value only (not others)
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.getToDoList();
  }
  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }
  public checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }
  downloadExcel() {

  }
}
