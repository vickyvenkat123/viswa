
import { Component, EventEmitter, OnInit, Output, Input, SimpleChanges } from '@angular/core';
import { DetailsService } from 'src/app/services/details.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Item } from '../item-dt/item-dt.component';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { ActivatedRoute } from '@angular/router';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { NeedApproval } from '../../master';
@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
})
export class ItemDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public item: Item | any;
  @Input() public isDetailVisible: boolean;
  public ItemIsApproved: boolean = false;
  public uoms;
  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  formPopulateData: any;
  constructor(
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    private commonToasterService: CommonToasterService,
    private route: ActivatedRoute,
    formDrawer: FormDrawerService
  ) {
    super('Item');

    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  ngOnInit(): void {
    this.formPopulateData = this.route.snapshot.data[
      'item_resolve'
    ].itemAdd.data;
    this.uoms = this.formPopulateData.item_uom;

  }

  checkApproval(item: Item) {
    if (this.item) {
      switch (this.item.need_to_approve) {
        case NeedApproval.NeedNotToApprove:
          this.ItemIsApproved = false;
          break;
        case NeedApproval.NeedToApprove:
          this.ItemIsApproved = true;
          break;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.item.firstChange) {
      this.checkApproval(changes.item.currentValue);
    }
  }

  approve() {
    if (this.item && this.item.objectid) {
      this.apiService.approveItem(this.item.objectid).subscribe((res: any) => {

        const approvedStatus: boolean = res.data.approved_or_rejected;
        if (res.status && approvedStatus) {
          this.commonToasterService.showSuccess("Approved", "Item has been Approved");
          this.ItemIsApproved = false;
          this.updateTableData.emit({ status: 'approve', ItemIsApproved: false });
        }
      });
    }
  }

  reject() {
    if (this.item && this.item.objectid) {
      this.apiService.rejectItemApproval(this.item.objectid).subscribe((res: any) => {
        this.commonToasterService.showSuccess("Reject", "Item Approval has been Rejected");
        this.ItemIsApproved = false;
        this.updateTableData.emit({ status: 'reject', ItemIsApproved: false });
      });
    }
  }


  public getUOMName(id) {
    const name = this.uoms.find((x) => x.id == id);
    return name ? name.name : '';
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditItem(): void {
    this.formDrawer.setFormName('item');
    this.formDrawer.setFormType('Edit');
    this.formDrawer.open();
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.item,
    });
  }
  public toggleStatus(): void {
    // this.item.item_status = this.item.item_status === 0 ? 1 : 0;
    let action = this.item.status === 0 ? 'active' : 'inactive';
    let ids = [];
    console.log(this.item.uuid);
    ids.push(this.item.uuid);
    let body = {
      module: 'Item',
      action: action,
      ids: ids
    };
    this.apiService.bulkAction(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.commonToasterService.showSuccess('Success', 'Action Successfull');
          body['edit'] = true;
          this.updateTableData.emit(body);
        } else {
          this.commonToasterService.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.commonToasterService.showError('Error', 'Action Un-successfull');
      }
    )
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete item ${this.item.item_name}`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteItem();
        }
      });
  }

  public deleteItem(): void {
    let delObj = { uuid: this.item.uuid, delete: true };
    this.apiService.deleteItem(this.item.uuid).subscribe((result) => {
      this.commonToasterService.showInfo('Deleted', 'Item deleted Sucessfully');
      this.updateTableData.emit(delObj);
      this.closeDetailView();
    });
  }
}
