import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  OnChanges,
} from '@angular/core';
import { DetailsService } from 'src/app/services/details.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Router } from '@angular/router';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-rebate-details',
  templateUrl: './rebate-details.component.html',
  styleUrls: ['./rebate-details.component.scss']
})
export class RebateDetailsComponent extends BaseComponent implements OnInit, OnChanges {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public rebate: any;
  @Input() public isDetailVisible: boolean;
  keyCombos;
  public keyCombination: any[];
  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  private router: Router;
  constructor(
    private commonToasterService: CommonToasterService,
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService,
    router: Router
  ) {
    super('Rebate');
    Object.assign(this, {
      apiService,
      deleteDialog,
      dataService,
      formDrawer,
      router,
    });
  }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
    this.apiService.getMasterDataListsByItem("route").subscribe((result: any) => {
      result.data.route.forEach(element => {
        if (element.id == this.rebate.route_id) {
          this.rebate['route_name'] = element.route_name;
        }
      });
    })
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }

  public openEditPricing(): void {
    this.dataService.sendData({
      type: CompDataServiceType.DATA_EDIT_FORM,
      data: this.rebate,
    });
    this.router.navigate([`pricing-plan/rebate/edit/${this.rebate.uuid}`]);
  }
  // public toggleStatus(): void {
  //   this.pricing.area_status = this.pricing.area_status === 0 ? 1 : 0;
  // }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete rebate ${this.rebate.name}`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteRebate();
        }
      });
  }

  public deleteRebate(): void {
    let delObj = { uuid: this.rebate.uuid, delete: true };
    this.apiService.deleteRebate(this.rebate.uuid).subscribe((result) => {
      this.commonToasterService.showInfo(
        'Deleted',
        'Rebate deleted sucessfully'
      );
      this.updateTableData.emit(delObj);
      this.closeDetailView();
    });
  }
}
