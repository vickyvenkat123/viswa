import { Component, OnInit, ViewChild, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/services/api.service';
import { ColumnConfig } from 'src/app/interfaces/interfaces';
import { SelectionModel } from '@angular/cdk/collections';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CompDataServiceType } from 'src/app/services/constants';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-users-dt',
  templateUrl: './users-dt.component.html',
  styleUrls: ['./users-dt.component.scss']
})
export class UsersDtComponent implements OnInit, OnDestroy {
  @Output() public itemClicked: EventEmitter<any> = new EventEmitter<any>();
  @Input() public isDetailVisible: boolean;

  public dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public selections = new SelectionModel(true, []);
  public displayedColumns: ColumnConfig[] = [];
  public filterColumns: ColumnConfig[] = [];

  private apiService: ApiService;
  private fds: FormDrawerService;
  private dataEditor: DataEditor;
  private deleteDialog: MatDialog;
  private subscriptions: Subscription[] = [];

  private allColumns: ColumnConfig[] = [
    { def: 'user_details', title: 'Details', show: true },
    { def: 'role', title: 'Role', show: true },
    { def: 'actions', title: 'Actions', show: true },

  ]
  private collapsedColumns: ColumnConfig[] = [
    { def: 'user_details', title: 'Details', show: true }
  ];


  constructor(
    apiService: ApiService,
    dataEditor: DataEditor,
    fds: FormDrawerService,
    deleteDialog: MatDialog) {
    Object.assign(this, { apiService, dataEditor, fds, deleteDialog });
    this.dataSource = new MatTableDataSource<Users>();
  }
  public ngOnInit(): void {
    this.fds.formType.subscribe(x => {
      if (x == 'user') {
        this.subscriptions.push(this.apiService.getAllInviteUser().subscribe((users: any) => {
          this.dataSource = new MatTableDataSource<Users>(users.data);
          this.dataSource.paginator = this.paginator;
          this.closeDetailView();
        }));
      }
    })
    this.displayedColumns = this.allColumns;
    this.filterColumns = [...this.allColumns].splice(1);

    this.subscriptions.push(this.apiService.getAllInviteUser().subscribe((users: any) => {
      this.dataSource = new MatTableDataSource<Users>(users.data);
      this.dataSource.paginator = this.paginator;
    }));

    this.subscriptions.push(this.dataEditor.newData.subscribe(value => {
      if (value.type === CompDataServiceType.CLOSE_DETAIL_PAGE) {
        this.closeDetailView();
      }
    }));
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public openDetailView(data: Users): void {
    this.isDetailVisible = true;
    this.itemClicked.emit(data);
    this.updateCollapsedColumns();
  }

  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.updateCollapsedColumns();
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

  public checkboxLabel(row?: Users): string {
    if (!row) {

      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }

    return `${this.selections.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public editCountry(country: any): void {
    this.dataEditor.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: country });
    this.openAddCountry();
  }

  public openDeleteBox(country: any): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete this country ?` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteCountry(country);
      }
    });
  }

  private deleteCountry(country: any): void {
    this.apiService.deleteCountry(country.uuid).subscribe(result => {
      window.location.reload();
    });
  }

  private openAddCountry(): void {
    this.fds.setFormName('country');
    this.fds.open();
  }

  private updateCollapsedColumns(): void {
    this.displayedColumns = this.isDetailVisible ? this.collapsedColumns : this.allColumns;
  }
}

export interface Users {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  uuid: string;
  mobile: string;
  role: {
    id: string;
    name: string;
  };
  status: string;
}