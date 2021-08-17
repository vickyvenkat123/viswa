import { CommonToasterService } from './../../../../../services/common-toaster.service';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Item } from 'src/app/components/main/master/item/item-dt/item-dt.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { BranchDepotMaster } from 'src/app/components/main/settings/location/branch/branch-depot-master-dt/branch-depot-master-dt.component';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  OrderModel,
  ItemAddTableHeader,
  OrderItemsPayload,
  OrderType,
  ApiItemPriceStats,
} from 'src/app/components/main/transaction/orders/order-models';
import { ITEM_ADD_FORM_TABLE_HEADS } from 'src/app/components/main/transaction/orders/order-form/order-form.component';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { CreditNoteService } from '../credit-note.service';
import { CreditNoteItemsComponent } from '../credit-note-items/credit-note-items.component';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { type } from 'os';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
import { MasterService } from '../../../master/master.service';
import { SalesMan } from '../../../master/salesman/salesman-dt/salesman-dt.component';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
@Component({
  selector: 'app-credit-note-form',
  templateUrl: './credit-note-form.component.html',
  styleUrls: ['./credit-note-form.component.scss'],
})
export class CreditNoteFormComponent implements OnInit, OnDestroy {
  public lookup$: Subject<any> = new Subject();
  public itemlookup$: Subject<any> = new Subject();
  public pageTitle: string;
  public isEditForm: boolean;
  public currentDate: any;
  public uuid: string;
  public isDepotOrder: boolean;
  public creditNoteData: any;
  public objectValues = Object.values;
  public invoices: any[] = [];
  public finalOrderPayload: any;
  public currencyCode = getCurrency();
  public selected_invoice: any = {
    invoice_number: "",
    grand_total: ""
  };
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public creditNoteStats: {
    [key: string]: { label: string; value: number };
  } = {
      total_gross: { label: 'Gross Total', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      total_discount_amount: { label: 'Discount', value: 0 },
      grand_total: { label: 'Total', value: 0 },
    };
  public deliveryFinalStats: {
    [key: string]: { label: string; value: number };
  } = {
      total_gross: { label: 'Gross Total', value: 0 },
      total_vat: { label: 'Vat', value: 0 },
      total_excise: { label: 'Excise', value: 0 },
      total_net: { label: 'Net Total', value: 0 },
      total_discount_amount: { label: 'Discount', value: 0 },
      grand_total: { label: 'Invoice Total', value: 0 },
    };

  public creditNoteForm: FormGroup;
  // public orderTypeFormControl: FormControl;
  public customerFormControl: FormControl;
  public customerLobFormControl: FormControl;
  public depotFormControl: FormControl;
  public numberFormControl: FormControl;
  public reasonFormControl: FormControl;
  public invoiceFormControl: FormControl;

  public creditNoteDateFormControl: FormControl;

  public itemTableHeaders: ItemAddTableHeader[] = [];

  // public orderTypes: OrderType[] = [];
  public items: Item[] = [];
  invoiceItems: any[] = [];
  creditLimit;
  public filteredItems: Item[] = [];

  public uoms: ItemUoms[] = [];
  public depots: BranchDepotMaster[] = [];
  public returnReasons: { id: number; name: string }[] = [];
  public terms: PaymentTerms[] = [];
  public payloadItems: OrderItemsPayload[] = [];
  public selectedPayloadItems: OrderItemsPayload[] = [];

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  public selectedOrderTypeId: number;
  public selectedOrderType: OrderType;
  public selectedDepotId: number;
  public selectedReasonId: number;
  public selectedPaymentTermId: number;
  public is_lob: boolean = false;

  public filterCustomer: Customer[] = [];
  isLoading: boolean;
  filterValue = '';
  public page = 1;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public item_total_pages = 0;
  public salesmanFormControl: FormControl;
  itemfilterValue = '';

  private router: Router;
  private creditNoteService: CreditNoteService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  private finalDeliveryPayload: any = {};
  private toaster: CommonToasterService;
  nextCommingNumberPrefix: any;
  public salesmen: SalesMan[] = [];

  constructor(
    creditNoteService: CreditNoteService,
    public apiService: ApiService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    toaster: CommonToasterService,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    private masterService: MasterService
  ) {
    Object.assign(this, {
      creditNoteService,
      dataService,
      dialogRef,
      elemRef,
      toaster,
      formBuilder,
      router,
      route,
    });
  }

  public ngOnInit(): void {
    let today = new Date();
    let month = '' + (today.getMonth() + 1);
    let date = '' + (today.getDate());
    if ((today.getMonth() + 1) < 10) {
      month = '0' + (today.getMonth() + 1);
    }
    if ((today.getDate() + 1) < 10) {
      date = '0' + (today.getDate());
    }

    this.currentDate = today.getFullYear() + '-' + month + '-' + date;
    this.getrouteitemgroupCode();

    this.setTableHeaders();

    // this.orderTypeFormControl = new FormControl(this.selectedOrderTypeId, [ Validators.required ]);
    this.depotFormControl = new FormControl(this.selectedDepotId, [
      Validators.required,
    ]);
    this.reasonFormControl = new FormControl(this.selectedReasonId, [
      Validators.required,
    ]);
    this.invoiceFormControl = new FormControl('', [Validators.required]);
    // this.paymentTermFormControl = new FormControl(this.selectedPaymentTermId, [ Validators.required ]);
    this.customerFormControl = new FormControl('', [Validators.required]);
    this.customerLobFormControl = new FormControl('', [Validators.required]);
    this.numberFormControl = new FormControl('', [Validators.required]);
    // this.noteFormControl = new FormControl('', [ Validators.required ]);
    // this.dueDateFormControl = new FormControl('', [ Validators.required ]);
    this.creditNoteDateFormControl = new FormControl(this.currentDate, [Validators.required]);
    this.salesmanFormControl = new FormControl('', [Validators.required])

    this.creditNoteForm = this.formBuilder.group({
      // 'order_type_id': this.orderTypeFormControl,
      // 'payment_term_id': this.paymentTermFormControl,
      depot_id: this.depotFormControl,
      credit_note_number: this.creditNoteDateFormControl,
      invoice_id: this.invoiceFormControl,
      salesman_id: this.salesmanFormControl,
      // 'any_comment': this.noteFormControl,
      // 'due_date': this.dueDateFormControl,
      credit_note_date: this.creditNoteDateFormControl,
      items: new FormArray([]),
    });
    this.addItemForm();
    //this.getItemsList();
    this.subscriptions.push(
      this.masterService.itemDetailListTable({ page: this.itempage, page_size: 10 }).subscribe((result) => {
        this.itempage++;
        this.items = result.data;
        this.filteredItems = result.data;
        this.item_total_pages = result.pagination?.total_pages
      })
    );
    this.isLoading = true;
    this.subscriptions.push(
      this.masterService.customerDetailListTable({ page: this.page, page_size: 10 }).subscribe((result) => {
        this.isLoading = false;
        this.page++;
        this.customers = result.data;
        this.filterCustomer = result.data;
        this.total_pages = result.pagination?.total_pages
      })
    );
    //this.customers = this.route.snapshot.data['resolved'].customers.data;
    //this.items = this.route.snapshot.data['resolved'].items.data;
    this.uoms = this.route.snapshot.data['resolved'].uoms.data;

    this.isEditForm = this.router.url.includes('credit-note/edit/');

    if (this.isEditForm) {
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = 'Edit Credit Note';
      this.creditNoteData = this.route.snapshot.data['resolved'].editData.data;
      console.log(this.route.snapshot.data['resolved']);
      this.setupEditFormControls(this.creditNoteData);
      this.numberFormControl.setValue(this.creditNoteData.credit_note_number);

    } else {
      this.pageTitle = 'Add Credit Note';
    }

    // this.subscriptions.push(
    //   this.customerFormControl.valueChanges
    //     .pipe(
    //       startWith<string | Customer>(''),
    //       map((value) =>
    //         typeof value === 'string'
    //           ? value
    //           : `${value.user.firstname} ${value.user.lastname}`
    //       ),
    //       map((value: string) => {
    //         return value.length
    //           ? this.filterCustomers(value)
    //           : this.customers.slice();
    //       })
    //     )
    //     .subscribe((value) => {
    //       this.filteredCustomers = value;
    //     })
    // );

    this.subscriptions.push(
      this.creditNoteService.getAllDepots().subscribe((result) => {
        this.depots = result.data;
      })
    );
    this.subscriptions.push(
      this.apiService.getSalesMan().subscribe((result) => {
        this.salesmen = result.data;
      })
    );

    // this.subscriptions.push(
    //   this.creditNoteService.getReturnReasons().subscribe((result) => {
    //     this.returnReasons = result.data;
    //   })
    // );
    this.subscriptions.push(
      this.creditNoteService.getReturnReasonsType().subscribe((result) => {
        this.returnReasons = result.data.filter(x => x.type == "Bad Return Reason" || x.type == "Good Return Reason");
      })
    );

    this.subscriptions.push(
      this.apiService.getCreditLimits().subscribe((result) => {
        this.creditLimit = result.data;
      })
    );

    this.lookup$
      .pipe(exhaustMap(() => {
        return this.masterService.customerDetailListTable({ name: this.filterValue.toLowerCase(), page: this.page, page_size: this.page_size })
      }))
      .subscribe(res => {
        this.isLoading = false;
        if (this.filterValue == "") {
          if (this.page > 1) {
            this.customers = [...this.customers, ...res.data];
            this.filterCustomer = [...this.filterCustomer, ...res.data];
          } else {
            this.customers = res.data;
            this.filterCustomer = res.data;
          }
          this.page++;
          this.total_pages = res?.pagination?.total_pages;
        } else {
          this.page = 1;
          this.customers = res.data;
          this.filterCustomer = res.data;
        }
      });

    this.itemlookup$
      .pipe(exhaustMap(() => {
        return this.masterService.itemDetailListTable({ item_name: this.itemfilterValue.toLowerCase(), page: this.itempage, page_size: this.page_size })
      }))
      .subscribe(res => {
        this.isLoading = false;
        if (this.itemfilterValue == "") {
          if (this.itempage > 1) {
            this.items = [...this.items, ...res.data];

            this.filteredItems = [...this.filteredItems, ...res.data];
          } else {
            this.items = res.data;
            this.filteredItems = res.data;
          }
          this.itempage++;
          this.item_total_pages = res?.pagination?.total_pages;
        } else {
          this.itempage = 1;
          this.items = res.data;
          this.filteredItems = res.data;
        }
      });

    this.invoiceFormControl.valueChanges.subscribe((value) => {
      if (this.isEditForm) {
        this.isEditForm = false;
        return;
      }
      this.openItemDialog();
    });
  }

  openItemDialog() {
    const invoice = this.invoices.find((item) => item.id == this.invoiceFormControl.value);
    if (!invoice) return;
    this.creditNoteService.getinvoiceitem(invoice.id).subscribe((resp) => {
      this.dialogRef
        .open(CreditNoteItemsComponent, {
          width: '500px',
          data: resp.data, //invoice['invoices'],
        })
        .afterClosed()
        .subscribe((data) => {
          if (data && data.length < 1) {
            return;
          }
          // const itemControls = this.creditNoteForm.controls[
          //   'items'
          // ] as FormArray;
          // itemControls.clear();
          const itemControls = this.creditNoteForm.controls['items'] as FormArray;
          for (let item of data) {
            var itemgroups = itemControls.value.filter(x => x.item.id == item.item.id && x.item_qty == item.item_qty);
            item.isInserted = false;
            if (itemgroups.length != 0) {
              item.isInserted = true;
            }
          }


          // this.payloadItems = [];
          // if (itemControls.length > 0) { //&& itemControls.at(0).get('item').value == ""
          //   itemControls.clear();
          // }
          Array.from(data).forEach((item: any) => {
            if (!item.isInserted) {
              this.addItemForm(item);
            }
          });
        });
    })
  }
  getSelectedInvoiceData(invoiceId) {
    this.selected_invoice = this.invoices.find((x) => x.id === invoiceId);
  }
  filterCustomers(customerName: string) {
    this.page = 1;
    this.filterValue = customerName.toLowerCase() || "";
    this.customers = [];
    this.filterCustomer = [];
    this.isLoading = true
    this.lookup$.next(this.page)
  }
  public customerSelected(customer, editData?): void {
    this.filterValue = "";
    this.lookup$.next(this.page)
    this.getCustomerLobList(customer, editData);
    this.getPendingInvoices();
  }
  customerLobList = [];
  getCustomerLobList(customer, editData?) {
    console.log(customer, editData);
    if (customer?.is_lob == 1 || editData?.lob) {
      this.is_lob = true;
      this.customerLobFormControl.setValidators([Validators.required]);
      this.customerLobFormControl.updateValueAndValidity();


      this.apiService.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
        this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
        if (editData) {
          setTimeout(() => {
            let customerLob = [{ id: editData?.lob_id, itemName: editData?.lob?.name }];
            this.customerLobFormControl.setValue(customerLob);
          }, 1000);
        }
      })
    }
    else {
      this.is_lob = false;
      this.customerLobFormControl.clearValidators();
      this.customerLobFormControl.updateValueAndValidity();
    }

  }

  onScroll() {
    if (this.total_pages <= this.page) return;
    this.isLoading = true;
    //console.log(this.isLoading)
    this.lookup$.next(this.page);
  }

  onScrollItem() {
    if (this.item_total_pages <= this.itempage) return;
    this.isLoading = true;
    this.itemlookup$.next(this.itempage);
  }

  goBackToCreditList() {
    this.router.navigate(['transaction/credit-note']);
  }

  customerLobSelected() {
    this.getPendingInvoices();
  }

  getPendingInvoices() {
    let body = {
      customer_id: this.customerFormControl.value.user.id,
    }
    this.creditNoteService.getcustomerinvoice(body).subscribe(
      (response) => {
        this.resetStats();
        const itemControls = this.creditNoteForm.controls['items'] as FormArray;
        itemControls.clear();
        this.invoices = response.data;
        console.log('this.invoices', response)
        if (this.isEditForm) {
          this.getSelectedInvoiceData(this.creditNoteData.invoice_id)
          this.creditNoteData.credit_note_details.forEach(
            (item, index: number) => {

              this.addItemForm(item);

              const itemStats = this.payloadItems[index];
              Object.keys(this.payloadItems[index]).forEach((key) => {
                itemStats[key] = item[key];
              });
            }
          );
          console.log(this.creditNoteData)
          this.invoiceFormControl.patchValue(this.creditNoteData.invoice.id);
          Object.keys(this.creditNoteStats).forEach((key) => {
            this.creditNoteStats[key].value = this.creditNoteData[key];
          });
        }
      },
      (error) => {
        //console.log(error);
      }
    );
  }

  public setTableHeaders(): void {
    this.itemTableHeaders = [...ITEM_ADD_FORM_TABLE_HEADS];
    this.itemTableHeaders.splice(3, 0, {
      id: 4,
      key: 'reason',
      label: 'Reason',
    });
    this.itemTableHeaders.splice(4, 0, {
      id: 5,
      key: 'invoiceNumber',
      label: 'Invoice Number',
    });
    this.itemTableHeaders.splice(5, 0, {
      id: 6,
      key: 'invoiceAmount',
      label: 'Invoice Amount',
    });
    this.itemTableHeaders.splice(7, 0, {
      id: 7,
      key: 'item_expiry_date',
      label: 'Expiry Date',
    });
    this.itemTableHeaders.forEach((head, index) => {
      this.itemTableHeaders[index].id = index;
    });
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  public openNumberSettings(): void {
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: {
          title: 'Credit Note Code',
          functionFor: 'credit_note ',
          code: this.numberFormControl.value,
          prefix: this.nextCommingNumberPrefix,
        },
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        //console.log(res);
        if (res.type == 'manual' && res.enableButton) {
          this.numberFormControl.setValue('');
          this.numberFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.numberFormControl.setValue(
            res.data.next_coming_number_bank_information
          );
          this.nextCommingNumberPrefix = res.reqData.prefix_code;
          this.numberFormControl.disable();
        }
      });
  }

  public setupEditFormControls(editData: any): void {
    console.log('editData', editData)
    editData.salesman = editData.salesman
      ? {
        salesman_id: editData.salesman.id,
        salesman_name: editData.salesman ? editData.salesman.firstname + " " + editData.salesman.lastname : '',
      }
      : null;
    if (editData.salesman) {
      let selectedSalesman = [{ id: editData.salesman.salesman_id, itemName: editData.salesman.salesman_name }];
      setTimeout(() => {
        this.salesmanFormControl.setValue(selectedSalesman);
      }, 1000);

    }
    const customer =
      this.customers &&
      this.customers.find((cust) => cust.user_id === editData.customer.id);
    this.filteredCustomers.push(customer);

    editData.customerObj = { id: editData.customer?.customerinfo?.id, user: editData.customer, user_id: editData.customer?.customerinfo?.user_id };
    editData.customer = editData.customer
      ? {
        customer_id: editData.customer.customer_id,
        user_id: editData.customer?.customerinfo?.user_id,
        customer_name: editData.customer
          ? editData.customer.firstname + ' ' + editData.customer.lastname
          : 'Unknown',
      }
      : undefined;
    this.customerFormControl.setValue(editData.customerObj);
    // this.getCustomerLobList(editData);
    // let customerLob = [{ id: editData.lob_id, itemName: editData.lob?.lob_name }]
    // this.customerLobFormControl.setValue(customerLob);

    this.creditNoteDateFormControl.setValue(editData.credit_note_date);
    this.numberFormControl.setValue(editData.credit_note_number);


    setTimeout(() => {
      // this.invoiceFormControl.setValue(editData?.invoice_id);
      this.reasonFormControl.setValue(editData.reason);
    }, 1000);
    this.customerSelected(editData.customer, editData);

  }

  public addItemForm(item?: any, isEdit?): void {
    console.log('item', item)
    const itemControls = this.creditNoteForm.controls['items'] as FormArray;
    // itemControls.controls.length = 0;
    if (item) {

      itemControls.push(
        this.formBuilder.group({
          item: new FormControl(
            { id: item?.item.id, code: item?.item.item_code, name: item?.item.item_name },
            [Validators.required]
          ),
          item_name: new FormControl(item?.item.item_name,
            [Validators.required]
          ),
          item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
          reason: new FormControl(item.reason, [Validators.required]),
          invoice_number: new FormControl(this.creditNoteData ? this.creditNoteData.invoice.invoice_number : item.invoice.invoice_number),
          invoice_amount: new FormControl(this.creditNoteData ? this.creditNoteData.invoice.grand_total : item.invoice.grand_total),

          item_qty: new FormControl(item.item_qty, [Validators.required, Validators.maxLength(item.item_qty)]),
          item_expiry_date: new FormControl(item.item_expiry_date, [Validators.required]),
          item_condition: new FormControl(1),
          item_price: new FormControl(item.item_price),
          item_discount_amount: new FormControl(item.item_discount_amount),
          item_vat: new FormControl(item.item_vat),
          item_net: new FormControl(item.item_net),
          item_excise: new FormControl(item.item_excise),
          item_grand_total: new FormControl(item.item_grand_total),
          item_uom_list: new FormControl([item.uom_info]),

        })
      );
    } else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl('', [Validators.required]),
          item_name: new FormControl('', [Validators.required]),
          item_uom_list: new FormControl([]),
          item_uom_id: new FormControl(undefined, [Validators.required]),
          reason: new FormControl(undefined, [Validators.required]),
          item_qty: new FormControl(1, [Validators.required]),
          item_expiry_date: new FormControl(1, [Validators.required]),
          item_condition: new FormControl(1),
          item_price: new FormControl(0),
          item_discount_amount: new FormControl(0),
          item_vat: new FormControl(0),
          item_net: new FormControl(0),
          item_excise: new FormControl(0),
          item_grand_total: new FormControl(0)
        })
      );
    }

    this.addItemFilterToControl(itemControls.controls.length - 1);
  }

  public reasonChanged(id: number): void {
    this.selectedReasonId = id;
    this.reasonFormControl.setValue(id);
  }

  public addCustomer(): void {
    this.router.navigate(['masters/customer'], {
      queryParams: { create: true },
    });
  }
  public redirectToItem(): void {
    this.router.navigate(['masters/item'], {
      queryParams: { create: true },
    });
  }
  public goToAllNotes(): void {
    this.router.navigate(['transaction/credit-note']);
  }

  public addItem(): void {
    this.addItemForm();
  }

  public itemDidSelected(event: any, item: OrderItemsPayload): void {
    const isChecked = event.target.checked;
    const currentIndex = this.selectedPayloadItems.indexOf(item);

    if (isChecked) {
      this.selectedPayloadItems.push(item);
    } else {
      this.selectedPayloadItems.splice(currentIndex, 1);
    }

    this.generatecreditNoteStats(false, true);
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom.name : '';
  }

  public get itemFormControls(): AbstractControl[] {
    const itemControls = this.creditNoteForm.get('items') as FormArray;

    return itemControls.controls;
  }

  public itemControlValue(item: Item): { id: string; name: string; code: string } {
    return { id: item.id, name: item.item_name, code: item.item_code };
  }

  public itemsControlDisplayValue(item?: {
    id: string;
    name: string;
    code: string;
  }): string | undefined {
    return item ? item.code ? item.code : '' + " " + item.name : undefined;
  }

  public customerControlDisplayValue(customer: Customer): string {
    return customer
      ? `${customer.user.firstname} ${customer.user.lastname}`
      : '';
  }

  public deleteItemRow(index: number): void {
    const itemControls = this.creditNoteForm.get('items') as FormArray;
    let selectedItemIndex: number;
    let isSelectedItemDelete = false;

    if (this.selectedPayloadItems.length) {
      const selectedItem = this.selectedPayloadItems.find(
        (item: OrderItemsPayload, i: number) =>
          item.item_id === itemControls.value[index].item.id
      );
      selectedItemIndex = this.selectedPayloadItems.indexOf(selectedItem);
      if (selectedItemIndex >= 0) {
        this.selectedPayloadItems.splice(selectedItemIndex, 1);
        isSelectedItemDelete = true;
      }
    }
    itemControls.removeAt(index);
    this.itemNameSubscriptions.splice(index, 1);
    this.itemControlSubscriptions.splice(index, 1);
    this.payloadItems.splice(index, 1);
    this.generatecreditNoteStats(true, isSelectedItemDelete);
  }

  public itemDidSearched(data: any, index: number): void {
    const selectedItem = this.items.find((item: Item) => item.id === data.id);
    const itemFormGroup = this.itemFormControls[index] as FormGroup;
    const itemnameControl = itemFormGroup.controls.item_name;
    itemnameControl.setValue(data.name);
    const uomControl = itemFormGroup.controls.item_uom_id;
    uomControl.setValue(selectedItem.lower_unit_uom_id);
    this.setUpRelatedUom(selectedItem, itemFormGroup);
  }

  setUpRelatedUom(selectedItem: any, formGroup: FormGroup) {
    let itemArray: any[] = [];
    const uomControl = formGroup.controls.item_uom_id;
    const baseUomFilter = this.uoms.filter(
      (item) => item.id == parseInt(selectedItem.lower_unit_uom_id)
    );
    let secondaryUomFilterIds = [];
    let secondaryUomFilter = [];
    if (selectedItem.item_main_price && selectedItem.item_main_price.length) {
      selectedItem.item_main_price.forEach((item) => {
        secondaryUomFilterIds.push(item.item_uom_id);
      });
      this.uoms.forEach((item) => {
        if (secondaryUomFilterIds.includes(item.id)) {
          secondaryUomFilter.push(item);
        }
      });
    }

    if (baseUomFilter.length && secondaryUomFilter.length) {
      itemArray = [...baseUomFilter, ...secondaryUomFilter];
    } else if (baseUomFilter.length) {
      itemArray = [...baseUomFilter];
    } else if (secondaryUomFilter.length) {
      itemArray = [...secondaryUomFilter];
    }
    formGroup.controls.item_uom_list.setValue(itemArray);
    if (baseUomFilter.length) {
      uomControl.setValue(selectedItem.lower_unit_uom_id);
    } else {
      uomControl.setValue(secondaryUomFilter[0].id);
    }
  }

  public postFinalPayload(): void {
    console.log('this.reasonFormControl.value', this.reasonFormControl.value)
    const totalStats = {};
    Object.keys(this.creditNoteStats).forEach((key: string) => {
      totalStats[key] = this.creditNoteStats[key].value;
    });
    const finalPayload = {
      customer_id: this.customerFormControl.value.user.id,
      lob_id: this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || "",
      ...this.creditNoteForm.value,
      ...totalStats,
      credit_note_number: this.numberFormControl.value,
      credit_note_date: this.creditNoteDateFormControl.value,
      source: 3,

      reason: this.reasonFormControl.value,
    };

    finalPayload.items = this.payloadItems;
    finalPayload['total_qty'] = finalPayload.items.length;
    if (this.salesmanFormControl.value.length > 0) {
      finalPayload['salesman_id'] = this.salesmanFormControl.value[0].id;
    }
    this.finalOrderPayload = { ...finalPayload };
    this.finalDeliveryPayload = { ...finalPayload };
    this.finalDeliveryPayload.items = this.selectedPayloadItems.length
      ? this.selectedPayloadItems
      : this.payloadItems;

    if (this.selectedPayloadItems.length) {
      Object.keys(this.deliveryFinalStats).forEach((key: string) => {
        this.finalDeliveryPayload[key] = this.deliveryFinalStats[key].value;
      });
      this.finalDeliveryPayload['total_qty'] = this.selectedPayloadItems.length;
    }

    this.makeOrderPostCall();
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.creditNoteForm.controls['items'] as FormArray;
    const newFormGroup = itemControls.controls[index] as FormGroup;

    this.itemNameSubscriptions.push(
      newFormGroup.controls['item'].valueChanges
        .pipe(
          distinctUntilChanged(
            (a, b) => JSON.stringify(a) === JSON.stringify(b)
          )
        )
        .pipe(
          startWith<string | Item>(''),
          map((value) => (typeof value === 'string' ? value : value.item_name)),
          map((value: string) => {
            return value;
          })
        ).subscribe((res) => {
          this.itemfilterValue = res || "";
          this.itempage = 1;
          this.isLoading = true;
          this.itemlookup$.next(this.itempage)
        })
    );

    this.payloadItems[index] = this.setupPayloadItemArray(newFormGroup);

    this.itemControlSubscriptions.push(
      newFormGroup.valueChanges.subscribe((result) => {
        const groupIndex = itemControls.controls.indexOf(newFormGroup);
        this.payloadItems[groupIndex] = this.setupPayloadItemArray(
          newFormGroup
        );
        if (
          newFormGroup.controls['item'].value &&
          newFormGroup.controls['item_uom_id'].value
        ) {
          const body: any = {
            item_id: result.item.id,
            item_uom_id: result.item_uom_id,
            item_qty: result.item_qty,
            item_expiry_date: result.item_expiry_date,
          };
          var _this = this;
          this.subscriptions.push(
            this.creditNoteService
              .getOrderItemStats(body)
              .subscribe((stats) => {
                if (stats.data.length == 0) {
                  _this.toaster.showInfo(
                    'Alert',
                    'Could not find data on selected parameter.'
                  );
                  return;
                }
                let newdata = stats.data;
                _this.payloadItems[groupIndex] = _this.setupPayloadItemArray(
                  newFormGroup,
                  stats.data
                );

                _this.generatecreditNoteStats(false, false);
              })
          );
        } else {
          this.payloadItems[groupIndex] = this.setupPayloadItemArray(
            newFormGroup
          );
          this.generatecreditNoteStats(false, false);
        }
      })
    );
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  private filterItems(itemName: string): Item[] {
    const filterValue = itemName.toLowerCase();

    return this.items.filter((item) =>
      item.item_name.toLowerCase().includes(filterValue) ||
      item.item_code.toLowerCase().includes(filterValue)
    );
  }

  // private filterCustomers(customerName: string): Customer[] {
  //   const filterValue = customerName.toLowerCase();

  //   return this.customers.filter(
  //     (customer) =>
  //       customer.user.firstname.toLowerCase().includes(filterValue) ||
  //       customer.user.lastname.toLowerCase().includes(filterValue)
  //   );
  // }

  public checkFormValidation(): boolean {
    if (!this.isDepotOrder && this.customerFormControl.invalid) {
      Utils.setFocusOn('customerFormField');
      return false;
    }
    if (!this.isDepotOrder && this.customerLobFormControl.invalid) {
      return false;
    }
    if (this.isDepotOrder && this.depotFormControl.invalid) {
      Utils.setFocusOn('depotFormField');
      return false;
    }
    if (this.reasonFormControl.invalid) {
      Utils.setFocusOn('reasonFormField');
      return false;
    }
    if (this.numberFormControl.invalid) {
      Utils.setFocusOn('numberField');
      return false;
    }
    return true;
  }

  private generatecreditNoteStats(
    isDeleted?: boolean,
    isItemSelection?: boolean
  ): void {
    Object.values(this.creditNoteStats).forEach((item) => {
      item.value = 0;
    });
    this.payloadItems.forEach((item: OrderItemsPayload) => {
      this.sumUpFinalStats(item, false);
    });
  }
  getrouteitemgroupCode() {
    let nextNumber = {
      function_for: 'credit_note ',
    };
    // this.creditNoteService
    //   .getNextCommingCode(nextNumber)
    //   .subscribe((res: any) => {
    //     if (res.status) {
    //       const data = res.data.number_is;
    //       this.nextCommingNumberPrefix = res.data.prefix_is;
    //       if (data) {
    //         this.numberFormControl.setValue(data);
    //         this.numberFormControl.disable();
    //       } else if (data == null) {
    //         this.numberFormControl.enable();
    //       }
    //     } else {
    //       this.numberFormControl.enable();
    //     }
    //   });
  }
  private sumUpFinalStats(
    item: OrderItemsPayload,
    isForDelivery?: boolean
  ): void {
    this.creditNoteStats.total_gross.value =
      this.creditNoteStats.total_gross.value + Number(item.item_grand_total);
    this.creditNoteStats.total_vat.value =
      this.creditNoteStats.total_vat.value + Number(item.item_vat);
    this.creditNoteStats.total_excise.value =
      this.creditNoteStats.total_excise.value + Number(item.item_excise);
    this.creditNoteStats.total_net.value =
      this.creditNoteStats.total_net.value + Number(item.item_net);
    this.creditNoteStats.total_discount_amount.value =
      this.creditNoteStats.total_discount_amount.value +
      Number(item.item_discount_amount);
    this.creditNoteStats.grand_total.value =
      this.creditNoteStats.grand_total.value + Number(item.item_grand_total);
  }
  private resetStats() {
    this.creditNoteStats.total_gross.value = 0;
    this.creditNoteStats.total_vat.value = 0;
    this.creditNoteStats.total_excise.value = 0;
    this.creditNoteStats.total_net.value = 0;
    this.creditNoteStats.total_discount_amount.value = 0;
    this.creditNoteStats.grand_total.value = 0;
  }
  private setupPayloadItemArray(
    form: FormGroup,
    result?: ApiItemPriceStats
  ): OrderItemsPayload {
    if (result) {
      return {
        item: form.controls.item.value,
        item_id: form.controls.item.value.id,
        item_qty: form.controls.item_qty.value,
        item_expiry_date: form.controls.item_expiry_date.value,
        item_condition: 1,
        batch_number: null,
        item_uom_id: form.controls.item_uom_id.value,
        reason: form.controls.reason.value || null,
        discount_id: result ? result.discount_id : null,
        promotion_id: result ? result.promotion_id : null,
        is_free: result ? result.is_free : false,
        is_item_poi: result ? result.is_item_poi : false,
        item_price: result ? +result.item_price : 0,
        item_discount_amount: result ? +result.discount : 0,
        item_vat: result ? +result.total_vat : 0,
        item_net: result ? +result.total_net : 0,
        item_excise: result ? +result.total_excise : 0,
        item_grand_total: result ? +result.total : 0,
        item_gross: result && result.item_gross ? Number(result.item_gross) : 0,
      };
    } else {
      return {
        item: form.controls.item.value,
        item_id: form.controls.item.value.id,
        item_qty: form.controls.item_qty.value,
        item_expiry_date: form.controls.item_expiry_date.value,
        item_condition: 1,
        batch_number: null,
        item_uom_id: form.controls.item_uom_id.value,
        reason: form.controls.reason.value || null,
        discount_id: result ? result.discount_id : null,
        promotion_id: result ? result.promotion_id : null,
        is_free: result ? result.is_free : false,
        is_item_poi: result ? result.is_item_poi : false,
        item_price: form.controls.item_price.value,
        item_discount_amount: form.controls.item_vat.value,
        item_vat: form.controls.item_vat.value,
        item_net: form.controls.item_net.value,
        item_excise: form.controls.item_excise.value,
        item_grand_total: form.controls.item_grand_total.value,
        item_gross: result && result.item_gross ? Number(result.item_gross) : 0,
      };
    }

  }

  private makeOrderPostCall(): void {
    if (!this.checkFormValidation()) {
      return;
    }
    const type =
      this.creditNoteData && this.creditNoteData.uuid ? 'edit' : 'create';
    if (type === 'create') {
      this.subscriptions.push(
        this.creditNoteService
          .addCreditNote(this.finalOrderPayload)
          .subscribe((result) => {
            this.toaster.showSuccess(
              'Success',
              'Credit not has been added successfuly.'
            );
            this.router.navigate(['transaction/credit-note']);
          })
      );
    } else if (type === 'edit') {
      this.subscriptions.push(
        this.creditNoteService
          .editCreditNote(this.creditNoteData.uuid, this.finalOrderPayload)
          .subscribe((result) => {
            this.toaster.showSuccess(
              'Success',
              'Credit not has been updated successfuly.'
            );
            this.router.navigate(['transaction/credit-note']);
          })
      );
    }
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
