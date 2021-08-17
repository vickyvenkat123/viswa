import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CompDataServiceType } from 'src/app/services/constants';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-session-endrossmentdt',
  templateUrl: './session-endrossmentdt.component.html',
  styleUrls: ['./session-endrossmentdt.component.scss']
})
export class SessionEndrossmentdtComponent implements OnInit {

  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private apiService: ApiService;
  private fds: FormDrawerService;
  filterForm: FormGroup;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];
  selectedColumnFilter: string;

  private allColumns: ColumnConfig[] = [
    { def: 'date', title: 'Date', show: true },
    { def: 'supervisor_name', title: 'Supervisor', show: true },
    { def: 'salesman_name', title: 'Salesman Name', show: true },
    { def: 'salesman_code', title: 'Salesman Code', show: true },
    { def: 'route', title: 'Route', show: true },
    { def: 'route_code', title: 'Route Code', show: true },
  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'date', title: 'Date', show: true },
    { def: 'supervisor_name', title: 'Supervisor', show: true },
  ];
  public allResData = [];
  public apiResponse = {
    pagination: {
      total_records: 0,
      total_pages: 0
    }
  };
  page = 1;
  pageSize = PAGE_SIZE_10;

  constructor(apiService: ApiService, public fb: FormBuilder, dataEditor: DataEditor, fds: FormDrawerService, deleteDialog: MatDialog, private route: Router) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Session>();
  }
  public ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      salesman_name: [''],
      salesman_code: [''],
      supervisor_name: [''],
      route: [''],
      route_code: [''],
      page: [this.page],
      page_size: [this.pageSize]
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.subscriptions.push(this.apiService.getSessionEndrossmentList(this.filterForm.value).subscribe((res: any) => {
      console.log('Customer : ', res.data);
      this.dataSource = new MatTableDataSource<any>(res.data);
      this.dataSource.paginator = this.paginator;
    }));
    // this.dataSource = new MatTableDataSource<Session>(sessionData);
    // this.dataSource.paginator = this.paginator;

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data): void {
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
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

  public checkboxLabel(row?: Session): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  getPaginatorValue(len: number) {
    return len < 10 ? true : false;
  }

  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getSessionEndorsementList();
  }

  getSessionEndorsementList() {
    this.subscriptions.push(this.apiService.getSessionEndrossmentList(this.filterForm.value).subscribe((res: any) => {
      this.apiResponse = res;
      this.allResData = res.data;
      this.updateDataSource(res.data);
    }));
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {
    if (!item) {
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.getSessionEndorsementList();
  }

  updateDataSource(data) {
    this.dataSource = new MatTableDataSource<any>(data);
    // this.dataSource.paginator = this.paginator;
  }

}
export interface Session {
  id: number
  checklistdate: string;
  salesman: string;
  route: string;
  status: number
};
export const sessionData = [{
  id: 1,
  checklistdate: "22/23/2020",
  salesman: "hello",
  route: "east",
  status: 1,
}]
