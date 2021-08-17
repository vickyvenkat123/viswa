import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { OrderExportComponent } from '../order-export/order-export.component';
import { OrderModel } from '../order-models';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-order-base',
  templateUrl: './order-base.component.html',
  styleUrls: ['./order-base.component.scss'],
})
export class OrderBaseComponent extends BaseComponent {
  public isDetailVisible: boolean;
  public orderData: OrderModel;
  checkedRows = [];
  private router: Router;
  public newOrderData = {};

  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  private fds: FormDrawerService;
  module: any;
  constructor(router: Router, fds: FormDrawerService, public apiService: ApiService,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,
    private dialog: MatDialog) {
    super('Order');
    Object.assign(this, { router, fds });
    this.module = {
      module: 'Order ',
      module_id: '',
    };
  }
  onClose() {
    this.fds.close();
  }
  ngAfterViewInit(): void {
    this.fds.setDrawer(this.fromDrawer);
  }
  public openForm() {
    this.router.navigate(['transaction/order', 'add']);
  }
  openHistoryView() {
    this.fds.setFormName('History');
    this.fds.setFormType('Add');
    this.fds.open();
  }

  public itemClicked(data: OrderModel): void {
    if (data) {
      this.isDetailVisible = true;
      this.orderData = data;
      const newModule = { ...this.module };
      newModule.module_id = data.id;
      this.module = JSON.parse(JSON.stringify(newModule));
    }
  }

  selectedRows(data: any) {
    this.checkedRows = data;
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  openExportOrder() {
    const dialogRef = this.dialog.open(OrderExportComponent);
  }

  openImportOrder() {
    this.router.navigate(['transaction/order', 'import']).then();
  }

  updateTableData(data) {
    this.newOrderData = data;
  }

  public bulkAction(action): void {
    let phrase = action == 'active' || action == "inactive" ? "mark as " + action : action;
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to ${phrase} selected Records `,
          btnText: phrase
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.hasConfirmed) {
          this.applyAulkAction(action);
        }
      });
  }

  applyAulkAction(action) {
    let ids = [];
    this.checkedRows.forEach(element => {
      ids.push(element.uuid);
    });
    let body = {
      module: 'order',
      action: action,
      ids: ids
    };
    this.apiService.bulkAction(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.checkedRows = [];
          this.cts.showSuccess('Success', 'Action Successfull');
          this.updateTableData({});
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    )
  }
}
