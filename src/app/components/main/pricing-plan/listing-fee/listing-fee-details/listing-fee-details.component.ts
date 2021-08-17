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
  selector: 'app-listing-fee-details',
  templateUrl: './listing-fee-details.component.html',
  styleUrls: ['./listing-fee-details.component.scss']
})
export class ListingFeeDetailsComponent extends BaseComponent implements OnInit, OnChanges {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @Input() public listingFee: any;
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
    super('Listing Fee');
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
        if (element.id == this.listingFee.route_id) {
          this.listingFee['route_name'] = element.route_name;
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
      data: this.listingFee,
    });
    this.router.navigate([`pricing-plan/listing-fee/edit/${this.listingFee.uuid}`]);
  }
  // public toggleStatus(): void {
  //   this.pricing.area_status = this.pricing.area_status === 0 ? 1 : 0;
  // }

  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete Listing Fee ${this.listingFee.name}`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteListingFee();
        }
      });
  }

  public deleteListingFee(): void {
    let delObj = { uuid: this.listingFee.uuid, delete: true };
    this.apiService.deleteListingFee(this.listingFee.uuid).subscribe((result) => {
      this.commonToasterService.showInfo(
        'Deleted',
        'Listing Fee deleted sucessfully'
      );
      this.updateTableData.emit(delObj);
      this.closeDetailView();
    });
  }
}
