import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
// import {ItemUoms} from '../../../components/datatables/itemuoms-dt/itemuoms-dt.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { GrnModel, GrnItemsPayload } from '../grn-models';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ItemAddTableHeader } from '../../../transaction/orders/order-models';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { ITEM_GRN_TABLE_HEADS } from '../grn-form/grn-form.component';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
@Component({
  selector: 'app-grn-detail',
  templateUrl: './grn-detail.component.html',
  styleUrls: ['./grn-detail.component.scss'],
})
export class GrnDetailComponent extends BaseComponent
  implements OnInit, OnDestroy {
  public uuid: string;
  public isDepotOrder: boolean;
  public grnData: GrnModel;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public hasApprovalPending: boolean;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public uoms: ItemUoms[] | any = [];

  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;

  constructor(
    apiService: ApiService,
    private CommonToasterService: CommonToasterService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute
  ) {
    super('GRN');
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      formBuilder,
      router,
      route,
    });
  }

  public ngOnInit(): void {
    this.itemTableHeaders = ITEM_GRN_TABLE_HEADS;
    this.uuid = this.route.snapshot.params.uuid;
    this.grnData = this.route.snapshot.data['grn'].returndata;
    console.log('grn', this.grnData.goodreceiptnotedetail)
    // this.hasApprovalPending = Boolean(this.grnData.approval_status);

    this.subscriptions.push(
      this.apiService.getItemUom().subscribe((result) => {
        this.uoms = result.data;
      })
    );
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public getUomValue(item: GrnItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom.name : '';
  }

  public goToOrders(): void {
    this.router.navigate(['inventory/grn']);
  }

  public editOrder(): void {
    this.router.navigate(['inventory/grn/edit', this.uuid]);
  }

  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.grnData.grn_number}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteOder();
        }
      });
  }

  private deleteOder(): void {
    this.apiService.deleteGRN(this.grnData.uuid).subscribe((result) => {
      this.CommonToasterService.showSuccess(
        '',
        'Deleted Successfully!Please check the table'
      );
      this.router.navigate(['inventory/grn']);
    });
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
