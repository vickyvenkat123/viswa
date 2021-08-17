import { Component, EventEmitter, OnInit, Output, Input, ViewChild, TemplateRef } from '@angular/core';
import { DetailsService } from 'src/app/services/details.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { Promotion } from '../promotion-dt/promotion-dt.component';
import { Router } from '@angular/router';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { CustomPaggingComponent } from 'src/app/features/shared/custom-pagging/custom-pagging.component';

@Component({
  selector: 'app-promotion-detail',
  templateUrl: './promotion-detail.component.html',
  styleUrls: ['./promotion-detail.component.scss'],
})
export class PromotionDetailComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public promotion: any;
  @Input() public isDetailVisible: boolean;
  @ViewChild('customPagging', { static: true }) customPagging: CustomPaggingComponent;

  keyCombos = keycombinations;
  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  public isPending: Boolean = false;
  private apiService: ApiService;
  private router: Router;
  promotiond_p_combination_slabs: any[] = [];
  @ViewChild("dialogRef") dialogRef: TemplateRef<any>;
  constructor(
    private commonToasterService: CommonToasterService,
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    formDrawer: FormDrawerService,
    router: Router
  ) {
    super('Promotion');
    Object.assign(this, {
      apiService,
      deleteDialog,
      dataService,
      formDrawer,
      router,
    });
  }

  ngOnInit(): void { }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  ngOnChanges(): void {
    if (this.promotion && this.promotion.keyCombinations)
      this.keyCombos = this.promotion?.keyCombinations;
    console.log('discount', this.promotion, 'keyCombos 1', this.keyCombos)
  }
  public openEditPromotion(): void {
    // this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.promotion });
    this.router.navigate([
      `pricing-plan/promotion/edit/${this.promotion.uuid}`,
    ]);
  }
  public toggleStatus(): void {
    // this.area.area_status = this.area.area_status === 0 ? 1 : 0;
  }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete promotion ${this.promotion.name}`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deletePromotion();
        }
      });
  }
  rejectLoad(): void {
    console.log('Rejected');
  }

  approveLoad(): void {
    console.log('Approved')
  }
  public openConfirmBox(type): void {
    this.deleteDialog.open(DeleteConfirmModalComponent, {
      width: '500px',
      data: { title: `Are you sure want to ${type} Promotion ${this.promotion.name}`, btnText: type }
    }).afterClosed().subscribe(data => {
      if (data.hasConfirmed) {
        if (type == 'approve') {
          this.approveLoad();
        } else if (type == 'reject') {
          this.rejectLoad();
        }
      }
    });
  }

  public deletePromotion(): void {
    let delObj = { uuid: this.promotion.uuid, delete: true };
    this.apiService.deletePromotion(this.promotion.uuid).subscribe((result) => {
      this.commonToasterService.showInfo(
        'Deleted',
        'Promotion deleted sucessfully'
      );
      this.updateTableData.emit(delObj);
      this.closeDetailView();
    });
  }

  openSlabDialog(value) {
    console.log(value);
    if (this.promotion.p_d_p_combination_slabs && this.promotion.p_d_p_combination_slabs.length > 0) {

      this.promotiond_p_combination_slabs = this.promotion.p_d_p_combination_slabs;//.filter(x => x.item_uom_id == value.item_uom_id)
      this.deleteDialog.open(this.dialogRef, {
        height: 'auto',
        width: '600px',
      });
    }
  }
}
const keycombinations = [
  {
    title: 'Region',
    data: ['East', 'North'],
  },
  {
    title: 'Route',
    data: ['route1', 'route2', 'route3', 'route4', 'route5', 'route6'],
  },
  {
    title: 'Channel',
    data: ['Channel1'],
  },
  {
    title: 'Item Group',
    data: ['Group A'],
  },
];
