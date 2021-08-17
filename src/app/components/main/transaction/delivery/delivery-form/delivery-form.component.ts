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
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
import { formatDate, DatePipe } from '@angular/common';
import { Customer } from 'src/app/components/main/master/customer/customer-dt/customer-dt.component';
import { BranchDepotMaster } from 'src/app/components/main/settings/location/branch/branch-depot-master-dt/branch-depot-master-dt.component';
import { ItemUoms } from 'src/app/components/main/settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import {
  OrderModel,
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess,
  ConvertDeliveryType,
} from 'src/app/components/main/transaction/orders/order-models';
import { ITEM_ADD_FORM_TABLE_HEADS } from 'src/app/components/main/transaction/orders/order-form/order-form.component';
import { OrderTypeFormComponent } from 'src/app/components/main/transaction/orders/order-type/order-type-form/order-type-form.component';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { SalesMan } from '../../../master/salesman/salesman-dt/salesman-dt.component';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { OrderService } from '../../orders/order.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { DeliveryService } from '../delivery.service';
import { InvoiceServices } from '../../invoice/invoice.service';
import * as moment from 'moment';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
import { MasterService } from '../../../master/master.service';
import { PAGE_SIZE_10 } from 'src/app/app.constant';
@Component({
  selector: 'app-delivery-form',
  templateUrl: './delivery-form.component.html',
  styleUrls: ['./delivery-form.component.scss'],
})
export class DeliveryFormComponent implements OnInit, OnDestroy {
  public todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  public dueDateSet: any;
  public currentDate: any;
  public pageTitle: string;
  public isEditForm: boolean;
  public isDeliveryForm: boolean;
  public uuid: string;
  public isDepotOrder: boolean;
  public deliveryNumber: string = '';
  public invoiceNumber: string = '';
  public deliveryData: OrderModel;
  public objectValues = Object.values;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  public orderFinalStats: {
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
  customerLobList = [];
  public orderFormGroup: FormGroup;
  public orderTypeFormControl: FormControl;
  public customerFormControl: FormControl;
  public customerLobFormControl: FormControl;
  public depotFormControl: FormControl;
  public salesmanFormControl: FormControl;
  public noteFormControl: FormControl;
  public paymentTermFormControl: FormControl;
  public deliveryDateFormControl: FormControl;
  public dueDateFormControl: FormControl;
  public itemTableHeaders: ItemAddTableHeader[] = [];
  public orderTypes: OrderType[] = [];
  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public uoms: ItemUoms[] = [];
  public depots: BranchDepotMaster[] = [];
  public salesmen: SalesMan[] = [];
  public terms: PaymentTerms[] = [];
  public payloadItems: OrderItemsPayload[] = [];
  public selectedPayloadItems: OrderItemsPayload[] = [];
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  public showGenerateInvoice: boolean = true;
  public selectedOrderTypeId: number;
  public selectedOrderType: OrderType;
  public selectedDepotId: number;
  public selectedSalesmanId: number;
  public selectedPaymentTermId: number;
  public nextCommingDeliveryCode: string = '';
  private router: Router;
  private apiService: ApiService;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  private finalOrderPayload: any = {};
  private finalDeliveryPayload: any = {};
  deliveryNumberPrefix: any;
  nextCommingDeliveryCodePrefix: any;
  creditLimit;
  public filterCustomer: Customer[] = [];
  public lookup$: Subject<any> = new Subject();
  public itemlookup$: Subject<any> = new Subject();
  isLoading: boolean;
  filterValue = '';
  public page = 1;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public item_total_pages = 0;
  itemfilterValue = '';
  public is_lob: boolean = false;
  constructor(
    private datePipe: DatePipe,
    private orderService: OrderService,
    apiService: ApiService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    private deliveryService: DeliveryService,
    private invoiceServices: InvoiceServices,
    private commonToasterService: CommonToasterService,
    private masterService: MasterService,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute
  ) {
    Object.assign(this, {
      apiService,
      dataService,
      dialogRef,
      elemRef,
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
    this.subscriptions.push(
      this.masterService.itemDetailListTable({ page: this.itempage, page_size: 10 }).subscribe((result) => {
        this.itempage++;
        this.items = result.data;
        this.filteredItems = result.data;
        this.item_total_pages = result.pagination?.total_pages
      })
    );
    this.isEditForm = this.router.url.includes('transaction/delivery/edit/');
    this.isDeliveryForm = this.router.url.includes(
      'transaction/delivery/start-delivery/'
    );
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;

    this.orderTypeFormControl = new FormControl(this.selectedOrderTypeId, [
      Validators.required,
    ]);
    this.depotFormControl = new FormControl(this.selectedDepotId, [
      Validators.required,
    ]);
    this.salesmanFormControl = new FormControl(this.selectedSalesmanId, [
      Validators.required,
    ]);
    this.paymentTermFormControl = new FormControl(this.selectedPaymentTermId, [
      Validators.required,
    ]);
    this.customerFormControl = new FormControl('', [Validators.required]);
    this.customerLobFormControl = new FormControl('', [Validators.required]);
    this.noteFormControl = new FormControl('', [Validators.required]);
    this.dueDateFormControl = new FormControl('', [Validators.required]);
    this.deliveryDateFormControl = new FormControl(this.currentDate, [Validators.required]);

    this.orderFormGroup = this.formBuilder.group({
      delivery_type: this.orderTypeFormControl,
      payment_term_id: this.paymentTermFormControl,
      depot_id: this.depotFormControl,
      salesman_id: this.salesmanFormControl,
      any_comment: this.noteFormControl,
      delivery_due_date: this.dueDateFormControl,
      delivery_date: this.deliveryDateFormControl,
      items: this.initItemFormArray(),
    });

    //this.items = this.route.snapshot.data['resolved'].items.data;

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
    this.uoms = this.route.snapshot.data['resolved'].uoms.data;
    //this.customers = this.route.snapshot.data['resolved'].customers.data;
    this.orderTypes = this.route.snapshot.data['resolved'].types.data;
    this.deliveryDateFormControl.valueChanges.subscribe(() => {
      this.setupDueDate();
    });

    if (this.isEditForm || this.isDeliveryForm) {
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = this.isEditForm ? 'Edit Delivery' : 'Customize Delivery';
      this.deliveryData = this.route.snapshot.data['delivery'];
      this.deliveryNumber = this.deliveryData?.delivery_number;

      this.setupEditFormControls(this.deliveryData);
    } else {
      this.pageTitle = 'Add Delivery';
      this.addItemFilterToControl(0);
    }

    if (this.isDeliveryForm) {
      this.deliveryDateFormControl.disable();
      this.dueDateFormControl.disable();
    }
    this.subscriptions.push(
      this.customerFormControl.valueChanges.subscribe((value) => {
        this.selectedPaymentTermId = value.payment_term_id;
        this.paymentTermFormControl.patchValue(value.payment_term_id);
      })
    );
    this.subscriptions.push(
      this.customerFormControl.valueChanges
        .pipe(
          debounceTime(500),
          startWith<string | Customer>(''),
          map((value) => (typeof value === 'string' ? value : value?.user?.firstname)),
          map((value: string) => {
            return value;
          })
        ).subscribe((res) => {

        })
    );

    this.subscriptions.push(
      this.apiService.getAllDepots().subscribe((result) => {
        this.depots = result.data;
      })
    );

    this.subscriptions.push(
      this.apiService.getCreditLimits().subscribe((result) => {
        this.creditLimit = result.data;
      })
    );

    this.subscriptions.push(
      this.apiService.getSalesMan().subscribe((result) => {
        this.salesmen = result.data;
      })
    );

    this.subscriptions.push(
      this.deliveryService.getPaymentTerm().subscribe((result) => {
        this.terms = result.data;
      })
    );
    this.getDeliveryCode();
    this.getOrderStatus();

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
          this.customers = [...this.customers, ...res.data];
          this.filterCustomer = [...this.filterCustomer, ...res.data];
        }
      })

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
      })
  }


  getCustomerLobList(customer, editData?) {
    this.filterValue = "";
    this.lookup$.next();
    if (this.customerFormControl.value.is_lob == 1) {
      this.is_lob = true;
      this.apiService.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
        this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
        if (editData) {
          this.customerLobFormControl.setValidators([Validators.required]);
          this.customerLobFormControl.updateValueAndValidity();
          setTimeout(() => {
            let customerLob = [{ id: editData?.lob_id, itemName: editData?.lob?.name }];
            this.customerLobFormControl.setValue(customerLob);
          }, 2000);
        }
        else {
          this.customerLobFormControl.setValidators([Validators.required]);
          this.customerLobFormControl.updateValueAndValidity();
        }
      })
    } else {
      this.is_lob = false;
      this.customerLobFormControl.clearValidators();
      this.customerLobFormControl.updateValueAndValidity();
    }
  }

  getOrderStatus() {
    if (this.isEditForm) {
      let orderStatus = this.getStatus(this.deliveryData.current_stage);
      orderStatus
        ? (this.showGenerateInvoice = false)
        : (this.showGenerateInvoice = true);
    } else {
      this.showGenerateInvoice = true;
    }
  }

  getDeliveryCode() {
    let nextNumber = {
      function_for: 'delivery',
    };
    this.orderService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingDeliveryCode = res.data.number_is;
        this.nextCommingDeliveryCodePrefix = res.data.prefix_is;
        if (this.nextCommingDeliveryCode) {
          // this.deliveryNumber = this.nextCommingDeliveryCode;
        } else if (this.nextCommingDeliveryCode == null) {
          this.nextCommingDeliveryCode = '';
          this.deliveryNumber = '';
        }
      } else {
        this.nextCommingDeliveryCode = '';
        this.deliveryNumber = '';
      }
    });
  }

  onScroll() {
    if (this.total_pages < this.page) return;
    this.isLoading = true;
    this.lookup$.next(this.page);
  }

  onScrollItem() {
    if (this.item_total_pages < this.itempage) return;
    this.isLoading = true;
    this.itemlookup$.next(this.itempage);
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Delivery Code',
      functionFor: 'delivery',
      code: this.deliveryNumber,
      prefix: this.nextCommingDeliveryCodePrefix,
      key: this.deliveryNumber.length ? 'autogenerate' : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.deliveryNumber = '';
          this.nextCommingDeliveryCode = '';
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.deliveryNumber = res.data.next_coming_number_delivery;
          this.nextCommingDeliveryCode = res.data.next_coming_number_delivery;
          this.nextCommingDeliveryCodePrefix = res.reqData.prefix_code;
        }
      });
  }

  public get filteredTableHeaders(): ItemAddTableHeader[] {
    return [...this.itemTableHeaders].filter((item) => item.show);
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  public setupEditFormControls(editData: any): void {
    this.orderTypeChanged(editData['delivery_type']);
    editData.salesman = editData.salesman
      ? {
        salesman_id: editData.salesman.id,
        salesman_name: editData.salesman ? editData.salesman.firstname + " " + editData.salesman.lastname : '',
      }
      : null;
    if (editData.salesman) {
      console.log(editData.salesman);
      let selectedSalesman = [{ id: editData.salesman.salesman_id, itemName: editData.salesman.salesman_name }];
      console.log(selectedSalesman);
      setTimeout(() => {
        this.salesmanFormControl.setValue(selectedSalesman);
      }, 1000);

    }
    // this.salesmanFormControl.setValue(
    //   editData.salesman ? editData.salesman['id'] : ''
    // );
    const customer = this.isDepotOrder
      ? undefined
      : this.customers &&
      this.customers.find((cust) => cust.user_id === editData.customer.id);
    this.filteredCustomers.push(customer);
    console.log('customer', customer)

    this.selectedOrderTypeId = editData['delivery_type'];
    this.selectedDepotId = editData['depot_id'];
    this.selectedPaymentTermId = editData.payment_term_id;
    this.paymentTermFormControl.setValue(editData.payment_term_id);
    editData.customerObj = { id: editData.customer?.customer_info?.id, user: editData.customer, user_id: editData.customer?.customer_info?.user_id };
    editData.customer = editData.customer_id
      ? {
        customer_id: editData.customer_id,
        user_id: editData.customer?.customer_info?.user_id,
        customer_name: editData.customer
          ? editData.customer.firstname + ' ' + editData.customer.lastname
          : 'Unknown',
      }
      : undefined;
    this.customerFormControl.setValue(editData.customerObj);
    this.getCustomerLobList(editData.customer, editData);
    this.noteFormControl.setValue(editData.customer_note);
    this.deliveryDateFormControl.setValue(editData.delivery_date);
    this.dueDateFormControl.setValue(editData['delivery_due_date']);
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;

    itemControls.controls.length = 0;
    console.log(editData.delivery_details);
    editData?.delivery_details.forEach(
      (item: any, index: number) => {
        let newItem = this.mapItem(item);
        this.addItemForm(newItem);
        this.itemDidSearched(newItem, index, true);
        const itemStats = this.payloadItems[index];
        Object.keys(this.payloadItems[index]).forEach((key) => {
          itemStats[key] = newItem[key];
        });
      }
    );
    Object.keys(this.orderFinalStats).forEach((key) => {
      this.orderFinalStats[key].value = editData[key];
    });
  }

  mapItem(apiItem) {
    const newItem: OrderItemsPayload = {
      item: {
        id: apiItem.item?.id,
        name: apiItem.item?.item_name,
        item_code: apiItem.item?.item_code,
        item_main_price: apiItem.item.item_main_price,
        item_uom_lower_unit: apiItem.item.item_uom_lower_unit
      },
      item_id: apiItem.item?.id,
      item_qty: apiItem?.item_qty,
      item_expiry_date: apiItem?.item_expiry_date,
      open_qty: apiItem?.open_qty,
      item_uom_id: apiItem.item_uom?.id.toString(),
      uom_info: apiItem?.item_uom,
      item_price: Number(apiItem?.item_price),
      item_discount_amount: Number(apiItem?.item_discount_amount),
      item_vat: Number(apiItem?.item_vat),
      item_excise: Number(apiItem?.item_excise),
      item_grand_total: Number(apiItem?.item_grand_total),
      item_net: Number(apiItem?.item_net),
      discount_id: apiItem?.discount_id,
      is_free: Boolean(apiItem?.is_free),
      is_item_poi: Boolean(apiItem?.is_item_poi),
      item_gross:
        apiItem && apiItem.item_gross ? Number(apiItem?.item_gross) : 0,
      order_status: apiItem && apiItem.order_status ? apiItem.order_status : '',
      id: apiItem ? apiItem.id : 0,
    };
    return newItem;
  }

  public addItemForm(item?: OrderItemsPayload): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    if (item) {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl(
            { id: item?.item.id, code: item?.item.item_code, name: item?.item.name },
            [Validators.required]
          ),
          item_name: new FormControl(item?.item.name,
            [Validators.required]
          ),
          item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
          item_qty: new FormControl(item.item_qty, [Validators.required]),
          item_uom_list: new FormControl([item.uom_info]),
        })
      );
    } else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl('', [Validators.required]),
          item_name: new FormControl('', [Validators.required]),
          item_uom_id: new FormControl(undefined, [Validators.required]),
          item_qty: new FormControl(1, [Validators.required]),
          item_uom_list: new FormControl([]),
        })
      );
    }

    this.addItemFilterToControl(itemControls.controls.length - 1);
  }

  public orderTypeChanged(id: number): void {
    if (id) {
      this.orderTypeFormControl.setValue(id);
      this.selectedOrderType = this.orderTypes.find((type) => type.id === id);
      this.isDepotOrder =
        this.selectedOrderType.use_for.toLowerCase() !== 'customer';
    }
  }

  public depotChanged(id: number): void {
    this.selectedDepotId = id;
    this.depotFormControl.setValue(id);
  }

  public salesmanChanged(id: number): void {
    this.selectedSalesmanId = id;
    this.salesmanFormControl.setValue(id);
  }

  public payTermChanged(id: number): void {
    this.selectedPaymentTermId = id;
    this.paymentTermFormControl.setValue(id);
    this.setupDueDate();
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
  public goToOrder(): void {
    this.router.navigate(['transaction/delivery']);
  }

  public addOrderType(): void {
    this.dialogRef
      .open(OrderTypeFormComponent, {
        width: '500px',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.orderTypes = data;
        }
      });
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

    this.generateOrderFinalStats(false, true);
  }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );
    return selectedUom ? selectedUom.name : '';
  }

  public get itemFormControls(): AbstractControl[] {
    const itemControls = this.orderFormGroup.get('items') as FormArray;
    return itemControls.controls;
  }

  public itemControlValue(item: Item): { id: string; name: string; code: string } {
    return { id: item.id, name: item.item_name, code: item.item_code };
  }

  public itemsControlDisplayValue(item?: {
    id: string;
    name: string;
    item_code: string
  }): string | undefined {
    return item ? item.item_code ? item.item_code : '' + " " + item.name : undefined;
  }

  public customerControlDisplayValue(customer: Customer): string {
    return customer
      ? customer?.user?.firstname + ' ' + customer?.user?.lastname
      : '';
  }

  public deleteItemRow(index: number): void {
    const itemControls = this.orderFormGroup.get('items') as FormArray;
    let selectedItemIndex: number;
    let isSelectedItemDelete = false;

    if (this.selectedPayloadItems.length) {
      const selectedItem = this.selectedPayloadItems.find(
        (item: OrderItemsPayload) =>
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
    this.generateOrderFinalStats(true, isSelectedItemDelete);
  }

  public itemDidSearched(data: any, index: number, isFromEdit?: boolean): void {
    console.log(data, this.items);
    if (isFromEdit) {
      // const selectedItem = this.items.find(
      //   (item: any) => item.id === data.item_id
      // );
      let selectedItem = data;
      selectedItem['lower_unit_uom_id'] = data?.item?.item_uom_lower_unit?.id || 0;
      selectedItem['item_main_price'] = data?.item?.item_main_price || [];
      // const uomControl = itemFormGroup.controls.item_uom_id;
      setTimeout(() => {
        this.setUpRelatedUom(selectedItem, itemFormGroup, true);
      }, 1000);
      console.log(selectedItem)
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      this.setUpRelatedUom(selectedItem, itemFormGroup);
    } else if (!isFromEdit) {
      const selectedItem = this.items.find((item: Item) => item.id === data.id);
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      const itemnameControl = itemFormGroup.controls.item_name;
      itemnameControl.setValue(data.name);
      this.setUpRelatedUom(selectedItem, itemFormGroup);
    }
  }

  setUpRelatedUom(selectedItem: any, formGroup: FormGroup, isEdit?: boolean) {
    let itemArray: any[] = [];
    const uomControl = formGroup.controls.item_uom_id;
    console.log(selectedItem)
    const baseUomFilter = this.uoms.filter(
      (item) => item.id == parseInt(selectedItem?.lower_unit_uom_id)
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
    if (isEdit) {
      setTimeout(() => {
        uomControl.setValue(selectedItem?.item_uom_id);
      }, 500);
    } else {
      if (baseUomFilter.length) {
        setTimeout(() => {
          uomControl.setValue(selectedItem?.lower_unit_uom_id);
        }, 500);
      } else {
        setTimeout(() => {
          uomControl.setValue(secondaryUomFilter[0]?.id);
        }, 500);
      }
    }
    // if (baseUomFilter.length) {
    //   uomControl.setValue(selectedItem.lower_unit_uom_id);
    // } else {
    //   uomControl.setValue(secondaryUomFilter[0].id);
    // }
  }

  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    if (this.isEditForm || this.isDeliveryForm) {
      return formArray;
    }

    formArray.push(
      this.formBuilder.group({
        item: new FormControl('', [Validators.required]),
        item_name: new FormControl('', [Validators.required]),
        item_uom_id: new FormControl(undefined, [Validators.required]),
        item_qty: new FormControl(1, [Validators.required]),
        item_uom_list: new FormControl([]),
      })
    );

    return formArray;
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
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
          this.itemlookup$.next(this.itempage)
        })
    );

    this.payloadItems[index] = this.setupPayloadItemArray(newFormGroup);

    this.itemControlSubscriptions.push(
      newFormGroup.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(
            (a, b) => JSON.stringify(a) === JSON.stringify(b)
          )
        )
        .subscribe((result) => {
          const groupIndex = itemControls.controls.indexOf(newFormGroup);
          if (
            newFormGroup.controls['item'].value &&
            newFormGroup.controls['item_uom_id'].value
          ) {
            const body: any = {
              item_id: result.item.id,
              item_uom_id: result.item_uom_id,
              item_qty: result.item_qty,
              customer_id: this.isDepotOrder
                ? null
                : this.customerFormControl.value.id,
              lob_id: this.isDepotOrder
                ? ''
                : (this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || ""),
              depot_id: this.isDepotOrder ? this.depotFormControl.value : null,
            };
            if (body.item_qty > 0) {
              this.subscriptions.push(
                this.orderService.getOrderItemStats(body).subscribe(
                  (stats) => {
                    this.payloadItems[groupIndex] = this.setupPayloadItemArray(
                      newFormGroup,
                      stats.data
                    );
                    this.generateOrderFinalStats(false, false);
                  },
                  () => {
                    this.commonToasterService.showError(
                      'Error in getting price detail'
                    );
                  }
                )
              );
            } else {
              this.commonToasterService.showWarning(
                'Item QTY should atleast be 1'
              );
              this.payloadItems[groupIndex] = this.setupPayloadItemArray(
                newFormGroup,
                this.setupEmptyItemValue
              );
              this.generateOrderFinalStats(false, false);
            }
          } else {
            this.payloadItems[groupIndex] = this.setupPayloadItemArray(
              newFormGroup
            );
            this.generateOrderFinalStats(false, false);
          }
        })
    );
  }

  get setupEmptyItemValue() {
    return {
      discount: 0,
      discount_id: 0,
      discount_percentage: 0,
      is_free: false,
      is_item_poi: false,
      item_gross: 0,
      item_price: 0,
      item_qty: 0,
      promotion_id: null,
      total: 0,
      total_excise: 0,
      total_net: 0,
      total_vat: 0,
    };
  }

  private setupDueDate(): void {
    const date = this.deliveryDateFormControl.value;
    const selectedTerm = this.terms.find(
      (term: PaymentTerms) => term.id === this.selectedPaymentTermId
    );
    if (!selectedTerm) return;
    var new_date = moment(date ? date : new Date())
      .add(selectedTerm.number_of_days, 'days')
      .format('YYYY-MM-DD');
    this.dueDateFormControl.setValue(new_date);
  }

  private filterItems(itemName: string): Item[] {
    const filterValue = itemName.toLowerCase();
    return this.items.filter((item) =>
      item?.item_name.toLowerCase().includes(filterValue) ||
      item.item_code.toLowerCase().includes(filterValue)
    );
  }

  filterCustomers(customerName: string) {
    this.page = 1;
    this.filterValue = customerName.toLowerCase() || "";
    this.customers = [];
    this.filterCustomer = [];
    this.isLoading = true
    this.lookup$.next(this.page)
  }

  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  public checkFormValidation(): boolean {
    if (this.orderTypeFormControl.invalid) {
      Utils.setFocusOn('typeFormField');
      return false;
    }
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
    // if (this.salesmanFormControl.invalid) {
    //   Utils?.setFocusOn('salesmanFormField');
    //   return false;
    // }
    if (this.paymentTermFormControl.invalid) {
      Utils.setFocusOn('termFormField');
      return false;
    }
    return true;
  }

  private generateOrderFinalStats(
    isDeleted?: boolean,
    isItemSelection?: boolean
  ): void {
    if (isItemSelection) {
      Object.values(this.deliveryFinalStats).forEach((item) => {
        item.value = 0;
      });

      this.selectedPayloadItems.forEach((item: OrderItemsPayload) => {
        this.sumUpFinalStats(item, true);
      });

      if (!isDeleted) {
        return;
      }
    }

    Object.values(this.orderFinalStats).forEach((item) => {
      item.value = 0;
    });

    this.payloadItems.forEach((item: OrderItemsPayload) => {
      this.sumUpFinalStats(item);
    });
  }

  private sumUpFinalStats(
    item: OrderItemsPayload,
    isForDelivery?: boolean
  ): void {
    if (isForDelivery) {
      this.deliveryFinalStats.total_gross.value =
        this.deliveryFinalStats.total_gross.value + item.item_grand_total;
      this.deliveryFinalStats.total_vat.value =
        this.deliveryFinalStats.total_vat.value + item.item_vat;
      this.deliveryFinalStats.total_excise.value =
        this.deliveryFinalStats.total_excise.value + item.item_excise;
      this.deliveryFinalStats.total_net.value =
        this.deliveryFinalStats.total_net.value + item.item_net;
      this.deliveryFinalStats.total_discount_amount.value =
        this.deliveryFinalStats.total_discount_amount.value +
        item.item_discount_amount;
      this.deliveryFinalStats.grand_total.value =
        this.deliveryFinalStats.grand_total.value + item.item_grand_total;
      return;
    }

    this.orderFinalStats.total_gross.value =
      this.orderFinalStats.total_gross.value + item.item_grand_total;
    this.orderFinalStats.total_vat.value =
      this.orderFinalStats.total_vat.value + item.item_vat;
    this.orderFinalStats.total_excise.value =
      this.orderFinalStats.total_excise.value + item.item_excise;
    this.orderFinalStats.total_net.value =
      this.orderFinalStats.total_net.value + item.item_net;
    this.orderFinalStats.total_discount_amount.value =
      this.orderFinalStats.total_discount_amount.value +
      item.item_discount_amount;
    this.orderFinalStats.grand_total.value =
      this.orderFinalStats.grand_total.value + item.item_grand_total;
  }

  private setupPayloadItemArray(
    form: FormGroup,
    result?: any
  ): OrderItemsPayload {
    return {
      item: form.controls.item.value,
      item_id: form.controls.item.value.id,
      item_qty: form.controls.item_qty.value,
      item_uom_id: form.controls.item_uom_id.value,
      discount_id: result && result.discount_id ? result.discount_id : null,
      promotion_id: result && result.promotion_id ? result.promotion_id : null,
      is_free: result ? result.is_free : false,
      is_item_poi: result ? result.is_item_poi : false,
      item_price: result && result.item_price ? Number(result.item_price) : 0,
      item_discount_amount:
        result && result.discount ? Number(result.discount) : 0,
      item_vat: result && result.total_vat ? Number(result.total_vat) : 0,
      item_net: result && result.total_net ? Number(result.total_net) : 0,
      item_excise:
        result && result.total_excise ? Number(result.total_excise) : 0,
      item_grand_total: result && result.total ? Number(result.total) : 0,
      item_gross: result && result.item_gross ? Number(result.item_gross) : 0,
    };
  }

  getItemStatus(items): boolean {
    let ordStatus: string = '';
    this.deliveryData['delivery_details'].forEach((item) => {
      if (item.item.id == items.value.item.id) {
        ordStatus = item.delivery_status;
      }
    });
    return this.getStatus(ordStatus);
  }

  getStatus(value: string): boolean {
    let status: boolean = false;
    switch (value) {
      case OrderUpdateProcess.Pending:
        status = false;
        break;
      case OrderUpdateProcess.PartialDeliver:
        status = false;
        break;
      case OrderUpdateProcess.PartialInvoice:
        status = true;
        break;
      case OrderUpdateProcess.InProcess:
        status = false;
        break;
      case OrderUpdateProcess.Accept:
        status = true;
        break;
      case OrderUpdateProcess.Delivered:
        status = true;
        break;
      case OrderUpdateProcess.Invoiced:
        status = true;
        break;
      case OrderUpdateProcess.Completed:
        status = true;
        break;
    }
    return status;
  }

  public postFinalOrder(target: string): void {
    const totalStats = {};
    Object.keys(this.orderFinalStats).forEach((key: string) => {
      totalStats[key] = this.orderFinalStats[key].value;
    });
    let body = this.orderFormGroup.value;
    body.salesman_id = body.salesman_id[0]?.id
    let customer_id = this.customerFormControl.value.user_id
      ? +this.customerFormControl.value.user_id
      : null;
    const finalPayload = {
      order_id: null,
      customer_id: customer_id,
      lob_id: this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || "",
      delivery_type_source: ConvertDeliveryType.DirectDelivery,
      ...body,
      ...totalStats,
      salesman_id: this.salesmanFormControl.value[0]?.id,
      delivery_number: this.deliveryNumber,
      current_stage_comment: 'pending',
      delivery_weight: 0,
      status: 1,
      source: 3,
    };

    this.payloadItems.forEach((item) => {
      item.is_free = false;
      item.is_item_poi = false;
    });
    finalPayload.items = this.payloadItems;
    finalPayload['total_qty'] = finalPayload.items.length;

    this.finalOrderPayload = { ...finalPayload };

    if (this.isEditForm) {
      this.finalOrderPayload.order_id = this.deliveryData.order_id;
    }

    this.finalOrderPayload.items.forEach((item) => {
      item['batch_number'] = null;
    });

    this.makeOrderPostCall(target);
  }

  private makeOrderPostCall(target: string): void {
    if (!this.checkFormValidation()) {
      return;
    }
    if (target === 'invoice') {
      this.subscriptions.push(
        this.deliveryService.addDelivery(this.finalOrderPayload).subscribe(
          (result) => {
            if (result.status) {
              this.commonToasterService.showSuccess(
                '',
                'Delivery has been successfuly added. Generating invoice of delivery.'
              );
              this.router.navigate([
                'transaction/invoice/generate-invoice',
                result.data.uuid,
              ]);
            }
          },
          (error) => {
            this.commonToasterService.showError(
              'Failed creating delivery',
              'Please try again'
            );
          }
        )
      );
      return;
    } else if (target === 'delivery') {
      if (this.isEditForm) {
        this.subscriptions.push(
          this.deliveryService
            .editDelivery(this.deliveryData.uuid, this.finalOrderPayload)
            .subscribe((result) => {
              this.commonToasterService.showSuccess(
                'Delivery edited sucessfully'
              );
              this.router.navigate(['transaction/delivery']);
            })
        );
      } else {
        this.subscriptions.push(
          this.deliveryService.addDelivery(this.finalOrderPayload).subscribe(
            (result) => {
              this.commonToasterService.showSuccess(
                'Delivery added sucessfully'
              );
              this.router.navigate(['transaction/delivery']);
            },
            (error) => {
              this.commonToasterService.showError(
                'Failed converting to delivery',
                'Please try again'
              );
            }
          )
        );
      }
    }
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}
