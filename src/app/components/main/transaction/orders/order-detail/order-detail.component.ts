import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import {
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess,
} from '../order-models';
import {
  APP_CURRENCY_CODE,
  CompDataServiceType,
} from 'src/app/services/constants';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { ITEM_ADD_FORM_TABLE_HEADS } from '../order-form/order-form.component';
import { Utils } from 'src/app/services/utils';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { OrderService } from '../order.service';
import { NeedApproval } from '../../../master/master';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public orderData: any;
  @Input() public isDetailVisible: boolean;
  @Output() public toggleHistory: EventEmitter<any> = new EventEmitter<any>();
  emailData: any;
  public color: ThemePalette = 'primary';
  public mode: ProgressSpinnerMode = 'indeterminate';
  public showSpinner: boolean = false;
  public uuid: string;
  domain = window.location.host.split('.')[0];
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

  public orderTypeTitle = '';
  public paymentTermTitle: string;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public orderTypes: OrderType[] = [];
  public uoms: ItemUoms[] | any = [];
  public terms: PaymentTerms[] = [];
  public showOrderStatusOptions: boolean = true;
  public showOrderEditAndDelete: boolean = true;
  private router: Router;
  private apiService: ApiService;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;
  public orderIsApproved: boolean = false;
  private dataService: DataEditor;
  orderTemplate: any;
  private sanitizer: DomSanitizer;

  constructor(
    private commonToasterService: CommonToasterService,
    private orderService: OrderService,
    apiService: ApiService,
    dataService: DataEditor,
    sanitizer: DomSanitizer,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute
  ) {
    super('Order');
    Object.assign(this, {
      apiService,
      sanitizer,
      dataService,
      dialogRef,
      formBuilder,
      router,
      route,
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

  ngOnChanges(changes: SimpleChanges) {
    console.log("render");
    if (changes.orderData?.currentValue != changes.orderData?.previousValue) {
      this.initForm(changes.orderData.currentValue);
      this.subscriptions.push(
        this.orderService.orderTypeList().subscribe((result) => {
          this.orderTypes = result.data;
          let name = this.orderTypes.find(
            (type) => type.id === this.orderData.order_type_id
          );
          this.orderTypeTitle = name?.name;
        })
      );
      this.hasApprovalPending =
        this.orderData.need_to_approve == 'yes' ? true : false;
      this.isDepotOrder = Boolean(this.orderData.depot);
      this.setTermsTitle();
      this.getOrderStatus(this.orderData.current_stage);
      this.uuid = this.orderData.uuid;

      if (this.orderData.id) {
        this.getDocument('print');
      }
    }
  }
  onToggleHistory() {
    this.toggleHistory.emit(true);
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  getOrderStatus(status: any) {
    switch (status) {
      case OrderUpdateProcess.Pending:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
      case OrderUpdateProcess.PartialDeliver:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = false;
        break;
      case OrderUpdateProcess.InProcess:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
      case OrderUpdateProcess.Accept:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
      case OrderUpdateProcess.Delivered:
        this.showOrderStatusOptions = false;
        this.showOrderEditAndDelete = false;
        break;
      case OrderUpdateProcess.Completed:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = false;
        break;
      case OrderUpdateProcess.Rejected:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
      case OrderUpdateProcess.Approved:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
    }
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }
  getDocument = (type) => {
    const model = {
      id: this.orderData.id,
      status: type,
    };

    this.orderService.getDocument(model).subscribe((res: any) => {
      if (res.status) {
        if (res.data && res.data.html_string) {
          this.orderTemplate = this.sanitizer.bypassSecurityTrustHtml(
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
  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );
    return selectedUom ? selectedUom.name : '';
  }

  public goToOrders(): void {
    this.router.navigate(['transaction/order']);
  }

  public setTermsTitle(): void {
    this.subscriptions.push(
      this.orderService.getPaymentTerm().subscribe((result) => {
        this.terms = result.data;
        this.paymentTermTitle = this.terms.find(
          (item) => item.id === this.orderData.payment_term_id
        )?.name;
      })
    );
  }

  public editOrder(): void {
    this.showSpinner = true;
    this.router.navigate(['transaction/order/edit', this.uuid]);
    this.showSpinner = false;
  }
  initForm(data) {
    const orgName = localStorage.getItem('org_name');
    const subject = `${orgName} sent you an order`;
    const message = `${orgName} sent you an order`;
    this.emailData = {
      email: data.customer.email,
      subject,
      message,
      type: 'order',
    };
  }
  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.orderData.order_number}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteOder();
        }
      });
  }

  public startDelivery(): void {
    this.router.navigate(['transaction/order/start-delivery', this.uuid]);
  }

  private deleteOder(): void {
    this.orderService.deleteOrder(this.orderData.uuid).subscribe(() => {
      this.commonToasterService.showInfo(
        'Order Deleted',
        'Order deleted sucessfully'
      );
      this.isDetailVisible = false;
      this.detailsClosed.emit();
      this.dataService.sendData({
        type: CompDataServiceType.CLOSE_DETAIL_PAGE,
        uuid: this.orderData.uuid,
      });
    });
  }

  approve() {
    if (this.orderData && this.orderData.objectid) {
      this.apiService
        .approveItem(this.orderData.objectid)
        .subscribe((res: any) => {
          const approvedStatus: boolean = res.data.approved_or_rejected;
          if (res.status && approvedStatus) {
            this.commonToasterService.showSuccess(
              'Approved',
              'Order has been Approved'
            );
            this.hasApprovalPending = false;
            this.dataService.sendData({
              type: CompDataServiceType.GET_NEW_DATA,
              data: { id: this.orderData.id }
            });
          }
        });
    }
  }
  reject() {
    if (this.orderData && this.orderData.objectid) {
      this.apiService
        .rejectItemApproval(this.orderData.objectid)
        .subscribe((res: any) => {
          this.commonToasterService.showSuccess(
            'Reject',
            'Order Approval has been Rejected'
          );
          this.hasApprovalPending = false;
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.orderData.id }
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
