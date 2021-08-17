import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  OrderModel,
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess
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
import { CreditNoteService } from '../credit-note.service';
import { CreditNoteInvoicesComponent } from '../credit-note-invoices/credit-note-invoices.component';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { DomSanitizer } from '@angular/platform-browser';
import { OrderService } from '../../orders/order.service';

@Component({
  selector: 'app-credit-note-detail',
  templateUrl: './credit-note-detail.component.html',
  styleUrls: ['./credit-note-detail.component.scss'],
})
export class CreditNoteDetailComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public creditNoteData: any;
  @Input() public isDetailVisible: boolean;
  @Output() public toggleHistory: EventEmitter<any> = new EventEmitter<any>();

  creditNoteTemplate: any;
  private sanitizer: DomSanitizer;
  public uuid: string;
  public isDepotOrder: boolean;
  emailData: any;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public hasApprovalPending: boolean;
  public orderStats: { key: string; label: string }[] = [
    { key: 'gross_total', label: 'Gross Total' },
    { key: 'total_vat', label: 'Vat' },
    { key: 'total_excise', label: 'Excise' },
    { key: 'total_net', label: 'Net Total' },
    { key: 'total_discount_amount', label: 'Discount' },
    { key: 'grand_total', label: 'Invoice Total' },
  ];

  public orderTypeTitle = '';
  public reasonTitle = '';
  public paymentTermTitle: string;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public orderTypes: OrderType[] = [];
  public uoms: ItemUoms[] | any = [];
  public terms: PaymentTerms[] = [];
  public showOrderStatusOptions: boolean = true;
  public showOrderEditAndDelete: boolean = true;


  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private dialogRef: MatDialog;
  private creditNoteService: CreditNoteService;

  public creditNoteIsApproved: boolean = false;

  constructor(
    apiService: ApiService,
    creditNoteService: CreditNoteService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    sanitizer: DomSanitizer,
    private orderService: OrderService,
    private commonToasterService: CommonToasterService
  ) {
    super('Credit Note');
    Object.assign(this, {
      creditNoteService,
      dataService,
      dialogRef,
      formBuilder,
      router,
      route,
      sanitizer,
      apiService,
    });
  }

  public ngOnInit(): void {
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;
    this.subscriptions.push(
      this.creditNoteService.getAllItemUoms().subscribe((result) => {
        this.uoms = result.data;
      })
    );
  }
  onToggleHistory() {
    this.toggleHistory.emit(true);
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log("render")
    console.log('creditNoteData', this.creditNoteData);

    if (
      changes.creditNoteData?.currentValue !=
      changes.creditNoteData?.previousValue
    ) {
      this.initForm(changes.creditNoteData.currentValue);
      this.uuid = this.creditNoteData.uuid;

      this.orderService.orderTypeList().subscribe((res: any) => {
        if (res.status && res.data) {
          this.creditNoteData["creditNoteType"] = res.data.find(x => x.id == Number(this.creditNoteData.order_type_id))?.name;
        }
      });

      this.hasApprovalPending =
        this.creditNoteData.need_to_approve == 'yes' ? true : false;
      this.isDepotOrder = Boolean(this.creditNoteData.depot);
      this.setTableHeaders();
      this.getCreditStatus(this.creditNoteData.current_stage);
      if (this.creditNoteData.id) {
        this.getDocument('print');
      }
    }
  };

  getCreditStatus(status: any) {
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
        this.showOrderStatusOptions = false;
        this.showOrderEditAndDelete = false;
        break;
      case OrderUpdateProcess.Approved:
        this.showOrderStatusOptions = false;
        this.showOrderEditAndDelete = false;
        break;
      case OrderUpdateProcess.Cancel:
        this.showOrderStatusOptions = true;
        this.showOrderEditAndDelete = true;
        break;
    }
    if (this.creditNoteData.pending_credit == "") {
      this.showOrderStatusOptions = false;
      this.showOrderEditAndDelete = false;
    }
    else {
      this.showOrderStatusOptions = true;
      this.showOrderEditAndDelete = true;
    }
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public setTableHeaders(): void {
    this.itemTableHeaders = [...ITEM_ADD_FORM_TABLE_HEADS];
    this.itemTableHeaders.splice(4, 0, {
      id: 5,
      key: 'reason',
      label: 'Reason',
    });
    this.itemTableHeaders.splice(5, 0, {
      id: 6,
      key: 'invoiceNumber',
      label: 'Invoice Number',
    });
    this.itemTableHeaders.splice(6, 0, {
      id: 7,
      key: 'invoiceAmount',
      label: 'invoice Amount',
    });
    this.itemTableHeaders.splice(8, 0, {
      id: 9,
      key: 'expiry_date',
      label: 'Expiry Date',
    });
    this.itemTableHeaders.forEach((head, index) => {
      this.itemTableHeaders[index].id = index;
    });
  }

  public getUomValue(item_uom_id: number): string {
    const selectedUom = this.uoms.find((uom) => uom.id === item_uom_id);
    return selectedUom ? selectedUom.name : '';
  }
  initForm(data) {
    const orgName = localStorage.getItem('org_name');
    const subject = `${orgName} sent you an credit note`;
    const message = `${orgName} sent you an credit note`;
    this.emailData = {
      email: data.customer.email,
      subject,
      message,
      type: 'credit-note',
    };
  }
  public editOrder(): void {
    this.router.navigate(['transaction/credit-note/edit', this.uuid]);
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
  }
  public openDeleteBox(): void {
    this.dialogRef
      .open(DeleteConfirmModalComponent, {
        width: '400px',
        data: { title: `Are you sure you want to delete?` },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteCreditNote();
        }
      });
  }
  getDocument = (type) => {
    const model = {
      id: this.creditNoteData.id,
      status: type,
    };

    this.creditNoteService.getDocument(model).subscribe((res: any) => {
      if (res.status) {
        if (res.data && res.data.html_string) {
          this.creditNoteTemplate = this.sanitizer.bypassSecurityTrustHtml(
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
  deleteCreditNote(): void {
    this.creditNoteService.deleteCreditNote(this.uuid).subscribe((result) => {
      this.isDetailVisible = false;
      this.detailsClosed.emit();
      this.dataService.sendData({
        type: CompDataServiceType.CLOSE_DETAIL_PAGE,
        uuid: this.creditNoteData.uuid,
      });
    });
  }
  public openApplyToInvoiceModal(): void {
    let body = {
      customer_id: this.creditNoteData?.customer?.id,
    }
    this.creditNoteService.getcustomerinvoice(body)
      .subscribe((response) => {
        this.dialogRef
          .open(CreditNoteInvoicesComponent, {
            width: '700px',
            data: { invoices: response, creditNoteData: this.creditNoteData },
          })
          .afterClosed()
          .subscribe((data) => { });
      });
  }
  redirecToEdit() {
    this.router.navigate([
      '/transaction/credit-note/edit',
      this.creditNoteData.uuid,
    ]);
  }

  approve() {
    //console.log(this.creditNoteData);
    if (this.creditNoteData && this.creditNoteData.objectid) {
      this.apiService
        .approveItem(this.creditNoteData.objectid)
        .subscribe((res: any) => {
          const approvedStatus: boolean = res.data.approved_or_rejected;
          if (res.status && approvedStatus) {
            this.commonToasterService.showSuccess(
              'Approved',
              'Credit Note has been Approved'
            );
            this.hasApprovalPending = false;
            this.dataService.sendData({
              type: CompDataServiceType.GET_NEW_DATA,
              data: { id: this.creditNoteData.id }
            });
          }
        });
    }
  }

  reject() {
    if (this.creditNoteData && this.creditNoteData.objectid) {
      this.apiService
        .rejectItemApproval(this.creditNoteData.uuid)
        .subscribe((res: any) => {
          this.commonToasterService.showSuccess(
            'Reject',
            'Credit Note Approval has been Rejected'
          );
          this.hasApprovalPending = true;
          this.dataService.sendData({
            type: CompDataServiceType.GET_NEW_DATA,
            data: { id: this.creditNoteData.id }
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
