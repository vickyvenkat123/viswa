import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CompDataServiceType } from 'src/app/services/constants';
import { Users } from '../../datatables/users-dt/users-dt.component';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { DeleteConfirmModalComponent } from '../../shared/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public user: Users | any;
  @Input() public isDetailVisible: boolean;

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;

  constructor(apiService: ApiService, deleteDialog: MatDialog, dataService: DataEditor, formDrawer: FormDrawerService) {
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  ngOnInit(): void {
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditUser(): void {
    this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.user });
    this.formDrawer.setFormName('user');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
  }
  // public toggleStatus(): void {
  //   this.customer.customer = this.customer.status === 0 ? 1 : 0;
  // }



  public openDeleteBox(): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to delete customer ${this.user.firstname}` }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        this.deleteCustomer();
      }
    });
  }

  public deleteCustomer(): void {
    this.apiService.deleteCustomer(this.user.uuid).subscribe(result => {
      window.location.reload();
    });
  }
}
