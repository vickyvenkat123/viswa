import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DeliveryModel } from '../delivery-model';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess,
} from 'src/app/components/main/transaction/orders/order-models';
import { ITEM_ADD_FORM_TABLE_HEADS } from 'src/app/components/main/transaction/orders/order-form/order-form.component';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DeliveryService } from '../delivery.service';
@Component({
  selector: 'app-delivery-detail',
  templateUrl: './delivery-detail.component.html',
  styleUrls: ['./delivery-detail.component.scss'],
})
export class DeliveryDetailComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public deliveryData: any;
  @Input() public isDetailVisible: boolean;
  @Output() public toggleHistory: EventEmitter<any> = new EventEmitter<any>();
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  emailData: any;
  public uuid: string;
  public isDepotOrder: boolean;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public hasApprovalPending: boolean;
  public orderStats: { key: string; label: string }[] = [
    { key: 'total_gross', label: 'Gross Total' },
    { key: 'total_vat', label: 'Vat' },
    { key: 'total_excise', label: 'Excise' },
    { key: 'total_net', label: 'Net Total' },
    { key: 'total_discount_amount', label: 'Discount' },
    { key: 'grand_total', label: 'Invoice Total' },
  ];
  public showOrderStatusOptions: boolean = true;
  public ShowGenerateInvoice: boolean = true;
  public orderTypeTitle: string = '';
  public paymentTermTitle: string = '';

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public orderTypes: OrderType[] = [];
  public uoms: ItemUoms[] | any = [];
  public terms: PaymentTerms[] = [];

  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;
  public deliveryIsApproved: boolean = false;
  private sanitizer: DomSanitizer;
  deliveryTemplate: any;
  private deliveryService: DeliveryService;
  showEditDel: boolean = true;
  constructor(
    apiService: ApiService,
    deliveryService: DeliveryService,
    private commonToasterService: CommonToasterService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    sanitizer: DomSanitizer
  ) {
    super('Delivery');
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      formBuilder,
      router,
      route,
      sanitizer,
      deliveryService,
    });
  }

  public ngOnInit(): void {
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;
    this.subscriptions.push(
      this.apiService.getItemUom().subscribe((result) => {
        this.uoms = result.data;
      })
    );
  }
  onToggleHistory() {
    this.toggleHistory.emit(true);
  }
  getDocument = (type) => {
    const model = {
      id: this.deliveryData.id,
      status: type,
    };

    this.deliveryService.getDocument(model).subscribe((res: any) => {
      if (res.status) {
        if (res.data && res.data.html_string) {
          this.deliveryTemplate = this.sanitizer.bypassSecurityTrustHtml(
            res.data.html_string
          );
        } else {
          const link = document.createElement('a');
          link.setAttribute('target', '_blank');
          link.setAttribute('href', `${res.data.file_url}`);
          link.setAttribute('download', `statement.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      }
    });
  };
  ngOnChanges(changes: SimpleChanges) {
    console.log('deliveryData', this.deliveryData)
    console.log("render");
    if (
      changes.deliveryData?.currentValue != changes.deliveryData?.previousValue
    ) {
      if (this.deliveryData?.current_stage == "Approved" && this.deliveryData?.approval_status == "Completed") {
        this.ShowGenerateInvoice = false;
      }
      else {
        this.ShowGenerateInvoice = true;
      }
      this.initForm(changes.deliveryData.currentValue);
      this.uuid = this.deliveryData.uuid;
      this.hasApprovalPending =
        this.deliveryData.need_to_approve == 'yes' ? true : false;
      this.isDepotOrder = Boolean(this.deliveryData.depot);
      this.setTermsTitle();
      this.getDeliveryStatus(this.deliveryData.current_stage);
      this.showEditDelOptions(this.deliveryData.current_stage);
      this.subscriptions.push(
        this.apiService.getOrderTypes().subscribe((result) => {
          this.orderTypes = result.data;
          let title = this.orderTypes.find(
            (type) => +type.id === +this.deliveryData.delivery_type
          );
          this.orderTypeTitle = title ? title?.name : '';
        })
      );

      if (this.deliveryData.id) {
        this.getDocument('print');
      }
    }
  }
  initForm(data) {
    const orgName = localStorage.getItem('org_name');
    const subject = `${orgName} sent you an delivery`;
    const message = `${orgName} sent you an delivery`;
    this.emailData = {
      email: data.customer.email,
      subject,
      message,
      type: 'delivery',
    };
  }
  showEditDelOptions(status) {
    switch (status) {
      case OrderUpdateProcess.PartialInvoice:
        this.showEditDel = false;
        break;
      case OrderUpdateProcess.Completed:
        this.showEditDel = false;
        break;
      case OrderUpdateProcess.Approved:
        this.showEditDel = true;
        break;
      case OrderUpdateProcess.Rejected:
        this.showEditDel = true;
        break;
      default:
        this.showEditDel = true;
        break;
    }
  }

  getDeliveryStatus(status: any) {
    switch (status) {
      case OrderUpdateProcess.Pending:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.PartialDeliver:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.PartialInvoice:
        status = true;
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.InProcess:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Accept:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Delivered:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Invoiced:
        status = true;
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Completed:
        this.showOrderStatusOptions = false;
        break;
      case OrderUpdateProcess.Rejected:
        this.showOrderStatusOptions = true;
        break;
      case OrderUpdateProcess.Approved:
        this.showOrderStatusOptions = true;
        break;
    }
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find((uom) => uom.id === item.item_uom_id);
    return selectedUom ? selectedUom.name : '';
  }

  public getCustomer(): string {
    return this.deliveryData?.customer
      ? this.deliveryData?.customer?.firstname +
      ' ' +
      this.deliveryData?.customer?.lastname
      : '';
  }
  public getCustomerLob(): string {
    return this.deliveryData?.lob
      ? this.deliveryData?.lob?.name : "";
  }

  public generateInvoice(): void {
    if (!this.deliveryData) {
      return;
    }
    const stringifiedData: string = JSON.stringify(this.deliveryData);
    window.localStorage.setItem('deliveryData', stringifiedData);
    this.router.navigate(['transaction/invoice/generate-invoice', this.uuid]);
  }

  public setTermsTitle(): void {
    this.subscriptions.push(
      this.apiService.getPaymenterms().subscribe((result) => {
        this.terms = result.data;
        let title = this.terms.find(
          (item) => item.id === this.deliveryData.payment_term_id
        );
        this.paymentTermTitle = title ? title.name : '';
      })
    );
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.deliveryData?.order?.order_number}?`,
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
    this.apiService.deleteOrder(this.deliveryData.uuid).subscribe((result) => {
      this.isDetailVisible = false;
      this.detailsClosed.emit();
      this.dataService.sendData({
        type: CompDataServiceType.CLOSE_DETAIL_PAGE,
        uuid: this.deliveryData.uuid,
      });
    });
  }

  approve() {
    if (this.deliveryData && this.deliveryData.objectid) {
      this.apiService
        .approveItem(this.deliveryData.objectid)
        .subscribe((res: any) => {
          const approvedStatus: boolean = res.data.approved_or_rejected;
          if (res.status && approvedStatus) {
            this.commonToasterService.showSuccess(
              'Approved',
              'Delivery has been Approved'
            );
            this.hasApprovalPending = false;
            this.dataService.sendData({
              type: CompDataServiceType.GET_NEW_DATA,
              data: { id: this.deliveryData.id }
            });
          }
        });
    }
  }

  reject() {
    if (this.deliveryData && this.deliveryData.objectid) {
      this.apiService
        .rejectItemApproval(this.deliveryData.objectid)
        .subscribe((res: any) => {
          this.commonToasterService.showSuccess(
            'Reject',
            'Delivery has been Rejected'
          );
          this.hasApprovalPending = false;
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.deliveryData.id }
          });
        });
    }
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
