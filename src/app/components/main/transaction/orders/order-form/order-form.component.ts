
import { PAGE_SIZE_10 } from './../../../../../app.constant';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { formatDate, DatePipe } from '@angular/common';
import { Subscription, Subject, of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import {
  OrderModel,
  ItemAddTableHeader,
  OrderType,
  OrderItemsPayload,
  OrderUpdateProcess,
} from '../order-models';
import {
  getCurrency,
  getCurrencyDecimalFormat,
  getCurrencyFormat,
  getCurrencyDecimalFormatNew,
} from 'src/app/services/constants';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import { Item } from '../../../master/item/item-dt/item-dt.component';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { BranchDepotMaster } from '../../../settings/location/branch/branch-depot-master-dt/branch-depot-master-dt.component';
import { PaymentTerms } from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { Customer } from '../../../master/customer/customer-dt/customer-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { OrderTypeFormComponent } from '../order-type/order-type-form/order-type-form.component';
import { SalesMan } from '../../../master/salesman/salesman-dt/salesman-dt.component';
import { OrderService } from '../order.service';
import { PromotionDailogComponent } from '../../../../dialogs/promotion-dailog/promotion-dailog.component';
import * as moment from 'moment';
import { TokenizeResult } from '@angular/compiler/src/ml_parser/lexer';
import { MasterService } from '../../../master/master.service';
import { BulkItemModalComponent } from '../../bulk-item-modal/bulk-item-modal.component';
@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss'],
})
export class OrderFormComponent implements OnInit, OnDestroy {
  public todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  public dueDateSet: any;
  public pageTitle: string;
  public isEditForm: boolean;
  public isDeliveryForm: boolean;
  public uuid: string = '';
  public isDepotOrder: boolean;
  public orderNumber: string = '';
  public lookup$: Subject<any> = new Subject();
  public itemlookup$: Subject<any> = new Subject();
  domain = window.location.host.split('.')[0];
  public orderData: OrderModel;
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

  public orderFormGroup: FormGroup;
  public orderTypeFormControl: FormControl;
  public customerFormControl: FormControl;
  public itemControls: FormControl;
  public customerLobFormControl: FormControl;
  public depotFormControl: FormControl;
  public salesmanFormControl: FormControl;
  public noteFormControl: FormControl;
  public paymentTermFormControl: FormControl;
  public dueDateFormControl: FormControl;
  public deliveryDateFormControl: FormControl;
  public customerLPOFormControl: FormControl;

  public currentDate: any;

  public itemTableHeaders: ItemAddTableHeader[] = [];

  public orderTypes: OrderType[] = [];
  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public filterCustomer: Customer[] = [];
  public uoms: ItemUoms[] = [];
  public depots: BranchDepotMaster[] = [];
  public salesmen: SalesMan[] = [];
  public terms: PaymentTerms[] = [];
  public payloadItems: OrderItemsPayload[] = [];
  public selectedPayloadItems: OrderItemsPayload[] = [];

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  public selectedOrderTypeId: number;
  public selectedOrderType: OrderType;
  public selectedDepotId: number;
  public selectedSalesmanId: number;
  public selectedPaymentTermId: number;
  public showConvertToDelivery: boolean = true;
  private router: Router;
  private apiService: ApiService;
  private masterService: MasterService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  private elemRef: ElementRef;
  private finalOrderPayload: any = {};
  private finalDeliveryPayload: any = {};
  public nextCommingNumberofOrderCode: string;
  public is_lob: boolean = false;
  public selectedUOMs: number;
  orderNumberPrefix: any;
  customerLobList = [];
  creditLimit;
  filterValue = '';
  itemfilterValue = '';
  public page = 1;
  public itempage = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public item_total_pages = 0;
  public freeItems = false;
  private noFirstReqInEdit = false;
  public isLoading: boolean;
  isCustomerlobShow: boolean = false;
  keyUp = new Subject<string>();
  keyUpItem = new Subject<string>();
  constructor(
    private datePipe: DatePipe,
    private orderService: OrderService,
    apiService: ApiService,
    public dialog: MatDialog,
    dataService: DataEditor,
    dialogRef: MatDialog,
    elemRef: ElementRef,
    formBuilder: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    masterService: MasterService,
    private CommonToasterService: CommonToasterService
  ) {
    Object.assign(this, {
      apiService,
      masterService,
      dataService,
      dialogRef,
      elemRef,
      formBuilder,
      router,
      route,
      dialog,
    });
  }

  async ngOnInit() {
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

    this.isEditForm = this.router.url.includes('transaction/order/edit/');
    this.isDeliveryForm = this.router.url.includes(
      'transaction/order/start-delivery/'
    );
    this.orderData = this.route.snapshot.data['order'];

    console.log('orderData', this.orderData)
    this.itemTableHeaders = ITEM_ADD_FORM_TABLE_HEADS;
    this.orderTypeFormControl = new FormControl(this.selectedOrderTypeId, [
      Validators.required,
    ]);
    this.depotFormControl = new FormControl(this.selectedDepotId, [
      Validators.required,
    ]);
    this.salesmanFormControl = new FormControl(this.selectedSalesmanId);
    this.paymentTermFormControl = new FormControl(this.selectedPaymentTermId, [
      Validators.required,
    ]);
    this.customerFormControl = new FormControl('', [Validators.required]);
    this.itemControls = new FormControl('', [Validators.required]);
    this.customerLobFormControl = new FormControl('');
    this.noteFormControl = new FormControl('', [Validators.required]);
    this.dueDateFormControl = new FormControl('', [Validators.required]);
    this.deliveryDateFormControl = new FormControl(this.currentDate, [Validators.required]);
    this.customerLPOFormControl = new FormControl('');
    this.orderFormGroup = this.formBuilder.group({
      order_type_id: this.orderTypeFormControl,
      payment_term_id: this.paymentTermFormControl,
      depot_id: this.depotFormControl,
      salesman_id: this.salesmanFormControl,
      any_comment: this.noteFormControl,
      due_date: this.dueDateFormControl,
      delivery_date: this.deliveryDateFormControl,
      items: this.initItemFormArray(),
    });
    this.isLoading = true;
    this.subscriptions.push(
      this.masterService.itemDetailListTable({ page: this.itempage, page_size: 10 }).subscribe((result) => {
        this.isLoading = false;
        this.itempage++;
        this.items = result.data;
        this.filteredItems = result.data;
        this.item_total_pages = result.pagination?.total_pages
      })
    );
    this.subscriptions.push(this.apiService.getAllItemUoms().subscribe((result) => { this.uoms = result.data; }));
    this.subscriptions.push(
      this.masterService.customerDetailListTable({ page: this.page, page_size: 10 }).subscribe((result) => {
        this.page++;
        this.customers = result.data;
        this.filterCustomer = result.data;
        this.total_pages = result.pagination?.total_pages
      })
    );
    const types = await this.apiService.getOrderTypes().toPromise();
    this.orderTypes = types && types.data;

    // this.subscriptions.push(this.apiService.getOrderTypes().subscribe(result => {
    //   this.orderTypes = result.data
    // }));
    this.subscriptions.push(
      this.apiService.getSalesMan().subscribe((result) => {
        this.salesmen = result.data;
      })
    );
    // this.items = this.route.snapshot.data['resolved'].items.data;
    // this.uoms = this.route.snapshot.data['resolved'].uoms.data;
    // this.customers = this.route.snapshot.data['resolved'].customers.data;
    // this.filterCustomer = this.route.snapshot.data['resolved'].customers.data;
    // this.total_pages = this.route.snapshot.data['resolved'].customers.pagination?.total_pages;
    // this.orderTypes = this.route.snapshot.data['resolved'].types.data;
    if (this.isEditForm || this.isDeliveryForm) {
      this.noFirstReqInEdit = true;
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = this.isEditForm ? 'Edit Order' : 'Customize Delivery';
      this.orderData = this.route.snapshot.data['order'];
      this.setupEditFormControls(this.orderData);
      this.customerLPOFormControl.setValue(this.orderData.customer_lop)
    } else {
      this.pageTitle = 'Add Order';
      this.addItemFilterToControl(0);
      this.getOrderCode();
    }

    if (this.isDeliveryForm) {
      this.deliveryDateFormControl.disable();
      this.dueDateFormControl.disable();
    }

    this.subscriptions.push(
      // this.customerFormControl.valueChanges
      //   .pipe(
      //     debounceTime(500),
      //     startWith<string | Customer>(''),
      //     map((value) => (typeof value === 'string' ? value : value?.user?.firstname)),
      //     map((value: string) => {
      //       return value;
      //     })
      //   ).subscribe((res) => {
      //     this.filterValue = res || "";
      //     this.lookup$.next(this.page)
      //   })
    );

    // this.subscriptions.push(
    //   this.itemControls.valueChanges
    //     .pipe(
    //       debounceTime(500),
    //       startWith<string | Item>(''),
    //       map((value) => (typeof value === 'string' ? value : value?.item_name)),
    //       map((value: string) => {
    //         debugger
    //         return value;
    //       })
    //     ).subscribe((res) => {
    //       this.filterValue = res || "";
    //       this.itemlookup$.next(this.page)
    //     })
    // )

    // this.subscriptions.push(
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
    // )

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
      this.orderService.getPaymentTerm().subscribe((result) => {
        this.terms = result.data;
      })
    );
    this.getOrderStatus();
    this.deliveryDateFormControl.valueChanges.subscribe(() => {
      this.setupDueDate();
    });

    this.customerLobFormControl.valueChanges.subscribe(res => {
      this.isCustomerlobShow = false;
      if (res.length > 0) {
        this.isCustomerlobShow = true;
      }
    });

    this.keyUp.pipe(
      map((event: any) => event.target.value),
      debounceTime(1000),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(res => {
      console.log("res", res)
      if (res)
        this.filterCustomers(res, true);
    });


    this.keyUpItem.pipe(
      map((event: any) => event.target.value),
      debounceTime(1000),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(res => {
      console.log("res", res)
      if (res)
        this.fiterItems(res);
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



  getOrderStatus() {
    if (this.isEditForm) {
      let orderStatus = this.getStatus(this.orderData.current_stage);
      orderStatus
        ? (this.showConvertToDelivery = false)
        : (this.showConvertToDelivery = true);
    } else {
      this.showConvertToDelivery = true;
    }
  }

  public get filteredTableHeaders(): ItemAddTableHeader[] {
    return [...this.itemTableHeaders].filter((item) => item.show);
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  getOrderCode() {
    let nextNumber = {
      function_for: 'order',
    };
    this.orderService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofOrderCode = res.data.number_is;
        this.orderNumberPrefix = res.data.prefix_is;
        if (this.nextCommingNumberofOrderCode) {
          this.orderNumber = this.nextCommingNumberofOrderCode;
        } else if (this.nextCommingNumberofOrderCode == null) {
          this.nextCommingNumberofOrderCode = '';
          this.orderNumber = '';
        }
      } else {
        this.nextCommingNumberofOrderCode = '';
        this.orderNumber = '';
      }
    });
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Order Code',
      functionFor: 'order',
      code: this.orderNumber,
      prefix: this.orderNumberPrefix,
      key: this.orderNumber.length ? 'autogenerate' : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.orderNumber = '';
          this.nextCommingNumberofOrderCode = '';
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.orderNumber = res.data.next_coming_number_order;
          this.nextCommingNumberofOrderCode = res.data.next_coming_number_order;
          this.orderNumberPrefix = res.reqData.prefix_code;
        }
      });
  }

  public setupEditFormControls(editData: any): void {
    this.orderTypeChanged(editData.order_type_id);
    if (editData.salesman) {
      let selectedSalesman = [{ id: editData.salesman.salesman_id, itemName: editData.salesman.salesman_name }];
      console.log(selectedSalesman);
      this.salesmanFormControl.setValue(selectedSalesman);
    }

    // this.salesmanFormControl.setValue(
    //   editData.salesman ? editData.salesman.salesman_id : ''
    // );
    console.log('this.isDepotOrder', this.isDepotOrder)
    const customer = this.isDepotOrder
      ? undefined
      : this.customers &&
      this.customers.find(
        (cust) => cust.user_id === editData.customer.customer_id
      );
    this.filteredCustomers.push(customer);
    this.orderNumber = editData.order_number;
    //console.log(this.orderNumber, editData.order_number);
    this.selectedOrderTypeId = editData.order_type_id;
    this.selectedDepotId = editData.depot && editData.depot.depot_id;
    this.selectedPaymentTermId = editData.payment_term_id;
    this.paymentTermFormControl.setValue(editData.payment_term_id);
    this.customerFormControl.setValue(editData.customerObj);
    this.getCustomerLobList(editData.customer, editData);
    this.noteFormControl.setValue(editData.customer_note);
    this.dueDateFormControl.setValue(editData.due_date);
    this.deliveryDateFormControl.setValue(editData.delivery_date);
    // this.salesmanChanged(editData.sales);
    console.log('editData', editData)
    editData.items.forEach((item: OrderItemsPayload, index: number) => {
      this.addItemForm(item);
      this.itemDidSearched(item, index, true);
      const itemStats = this.payloadItems[index];
      Object.keys(this.payloadItems[index]).forEach((key) => {
        itemStats[key] = item[key];
      });
    });

    Object.keys(this.orderFinalStats).forEach((key) => {
      this.orderFinalStats[key].value = editData[key];
    });
  };


  getCustomerLobList(customer, editData?) {
    this.filterValue = "";
    let paymentTermId
    if (this.isEditForm && editData) {
      paymentTermId = editData?.payment_term_id;
    } else {
      paymentTermId = customer?.payment_term_id;
    }

    if (customer?.is_lob == 1 || editData?.lob) {
      this.is_lob = true;
      this.customerLobFormControl.setValidators([Validators.required]);
      this.customerLobFormControl.updateValueAndValidity();
      this.selectedPaymentTermId = paymentTermId
      this.apiService.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
        this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
        if (editData) {
          setTimeout(() => {
            this.paymentTermFormControl.patchValue(this.selectedPaymentTermId);
            let customerLob = [{ id: editData?.lob_id, itemName: editData?.lob?.name }];
            this.customerLobFormControl.setValue(customerLob);
          }, 1000);
        }
      });

    }
    else {
      this.is_lob = false;
      this.customerLobFormControl.clearValidators();
      this.customerLobFormControl.updateValueAndValidity();
      this.selectedPaymentTermId = paymentTermId
      this.paymentTermFormControl.patchValue(this.selectedPaymentTermId);
    }

  }

  createItemFormGroup(item, isBulk = false) {
    let group;
    if (item && isBulk) {
      group = new FormGroup({
        item: new FormControl({ id: item.id, name: item.name, item_code: item.item_code }, [
          Validators.required,
        ]),
        item_name: new FormControl(item.name, [
          Validators.required,
        ]),
        item_uom_id: new FormControl(item.selected_item_uom, [Validators.required]),
        item_qty: new FormControl(item?.quantity, [Validators.required]),
        item_uom_list: new FormControl([item.item_uom_list]),
        is_free: new FormControl(item?.is_free || false)
      });
    }
    else if (item && !isBulk) {
      group = new FormGroup({
        item: new FormControl({ id: item.item.id, name: item.item.name, item_code: item.item.item_code }, [
          Validators.required,
        ]),
        item_name: new FormControl(item.item.name, [
          Validators.required,
        ]),
        item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
        item_qty: new FormControl(item.item_qty, [Validators.required]),
        item_uom_list: new FormControl([item.uom_info]),
        is_free: new FormControl(item?.is_free || false)
      });
    } else {
      group = new FormGroup({
        item: new FormControl('', [Validators.required]),
        item_name: new FormControl('', [Validators.required]),
        item_uom_id: new FormControl(undefined, [Validators.required]),
        item_qty: new FormControl(1, [Validators.required]),
        item_uom_list: new FormControl([]),
        is_free: new FormControl(false)
      });
    }
    // group.valueChanges.pipe(first()).subscribe((response) => {
    //   this.getPromotion(response);
    // });
    return group;
  }
  public addItemForm(item?: OrderItemsPayload): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    let group = this.createItemFormGroup(item);
    itemControls.push(group);
    this.addItemFilterToControl(itemControls.controls.length - 1, true);
  }

  public getPromotion(data, index?): void {

    if (data) {
      let items = this.itemFormControls.filter((x) => x?.value?.is_free == false);
      let itemsLength = items.length;
      let itemids = [];
      let itemuomids = [];
      let itemqtys = [];
      items.forEach((itemgroup) => {
        if (itemgroup && !itemgroup?.value?.is_free) {
          itemgroup.value.item.id && itemids.push(itemgroup.value.item.id);
          itemgroup.value.item_uom_id && itemuomids.push(itemgroup.value.item_uom_id);
          itemgroup.value.item_qty && itemqtys.push(itemgroup.value.item_qty);
        }
      })
      const model = {
        item_id: itemids,//[data.item.id],
        item_uom_id: itemuomids,//[data.item_uom_id],
        item_qty: itemqtys,//[data.item_qty],
        customer_id: this.customerFormControl.value?.id || this.customerFormControl.value?.user_id,
      };
      if (!model.item_id.length) return;
      this.orderService
        .getPromotionItems(model)
        .pipe()
        .subscribe((result) => {
          if (
            result &&
            result.data &&
            result.data.itemPromotionInfo.length > 0
          ) {
            const status = result.data.itemPromotionInfo[0].offer_item_type;
            if (status == 'Any') {
              this.openPromotionPopup(result.data, itemsLength);
            } else {
              const itemControls = this.orderFormGroup.get('items') as FormArray;
              itemControls.value.map(
                (item) => { item.is_free === true && this.deleteItemRow(itemControls.value.findIndex(x => x.is_free === true)) }
              );
              result.data.offer_items.forEach((element) => {
                const added = itemControls.value.find(
                  (item) => item.item.id === element.item_id && item.is_free == true
                );
                this.freeItems = true;
                if (added) return;
                element.item.name = element.item.item_name;
                element.item_price = element?.item?.lower_unit_item_price;
                element.discount = Number(element.offered_qty) * Number(element?.item?.lower_unit_item_price);
                element.item_qty = Number(element.offered_qty);
                element['is_free'] = true;
                this.addItemForm(element);
                let item = { id: element.item.id, name: element.item.name };
                this.itemDidSearched(element, itemControls.value.length - 1, true);
                const newFormGroup = itemControls.controls[itemControls.value.length - 1] as FormGroup;
                this.payloadItems[itemControls.value.length - 1] = this.setupPayloadItemArray(
                  newFormGroup,
                  element
                );
              });
            }
          } else {
            const itemControls = this.orderFormGroup.get('items') as FormArray;
            itemControls.value.map(
              (item) => { item.is_free === true && this.deleteItemRow(itemControls.value.findIndex(x => x.is_free === true)) }
            );
          }
        });
    }
  }

  public openPromotionPopup = (promotion, index) => {
    this.dialog
      .open(PromotionDailogComponent, {
        width: '600px',
        height: 'auto',
        data: {
          title: 'Promotions',
          data: promotion,
        },
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        const itemControls = this.orderFormGroup.get('items') as FormArray;
        // console.log(itemControls);
        // itemControls.value.map(
        //   (item) => { item.is_free === true && this.deleteItemRow(itemControls.value.findIndex(x => x.is_free === true)) }
        // );
        if (res && res.length > 0) {
          this.dialog.closeAll();
          res.forEach((element) => {
            const added = itemControls.value.find(
              (item) => item.item.id === element.item_id && item.is_free == true
            );
            this.freeItems = true;
            if (added) {
              // let indexOf = itemControls.value.indexOf(added);
              // let qty = parseInt(added.item_qty) + 1;
              // itemControls.at(indexOf).get("item_qty").setValue(qty);
              return;
            }
            element.item.name = element.item.item_name;
            element.item_price = element?.item?.lower_unit_item_price;
            element.discount = Number(element.offered_qty) * Number(element?.item?.lower_unit_item_price);
            element.item_qty = Number(element.offered_qty);
            element['is_free'] = true;
            this.addItemForm(element);

            let item = { id: element.item.id, name: element.item.name };
            this.itemDidSearched(element, itemControls.value.length - 1, true);
            const newFormGroup = itemControls.controls[itemControls.value.length - 1] as FormGroup;
            this.payloadItems[itemControls.value.length - 1] = this.setupPayloadItemArray(
              newFormGroup,
              element
            );
          });
        }
      });
  };

  public orderTypeChanged(id: number): void {
    if (id) {
      this.orderTypeFormControl.setValue(id);
      this.selectedOrderType = this.orderTypes.find((type) => type.id === id);
      this.isDepotOrder =
        this.selectedOrderType?.use_for.toLowerCase() !== 'customer';
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

  public goBackToOrdersList(): void {
    this.router.navigate(['transaction/order']);
  }

  public goToOrder(): void {
    this.postFinalOrder('order');
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

  public itemControlValue(item: Item): { id: string; name: string, item_code: string } {
    return { id: item.id, name: item.item_name, item_code: item.item_code };
  }

  public itemsControlDisplayValue(item?: {
    id: string;
    name: string;
    item_code: string;
  }): string | undefined {
    return item ? item.item_code ? item.item_code : '' + " " + item.name : undefined;
  }

  public customerControlDisplayValue(customer: Customer): string {
    return `${customer?.user?.firstname ? customer?.user?.firstname : ''} ${customer?.user?.lastname ? customer?.user?.lastname : ''}`
  }

  public deleteItemRow(index: number): void {
    const itemControls = this.orderFormGroup.get('items') as FormArray;
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
    this.generateOrderFinalStats(true, isSelectedItemDelete);
  }

  public itemDidSearched(data: any, index: number, isFromEdit?: boolean): void {

    if (isFromEdit) {
      this.itemfilterValue = '';
      // const selectedItem = this.items.find(
      //   (item: Item) => item.id === data.item_id
      // );
      let selectedItem = data;
      selectedItem['lower_unit_uom_id'] = data?.item?.item_uom_lower_unit?.id || 0;
      selectedItem['item_main_price'] = data?.item?.item_main_price || [];
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      // const uomControl = itemFormGroup.controls.item_uom_id;
      // let IsEdit = true;
      // if (selectedItem?.is_free) {
      //   IsEdit = false
      // }
      setTimeout(() => {
        this.setUpRelatedUom(selectedItem, itemFormGroup, true);
      }, 1000);

    } else if (!isFromEdit) {
      const selectedItem = this.items.find((item: Item) => item.id === data.id);
      const itemFormGroup = this.itemFormControls[index] as FormGroup;
      const itemnameControl = itemFormGroup.controls.item_name;
      console.log('itemFormGroup', itemnameControl, itemFormGroup.controls)
      if (itemnameControl) itemnameControl.setValue(data.name);
      // const itemCodeControl = itemFormGroup.controls.code;
      // if (itemCodeControl) itemCodeControl.setValue(data.code);
      this.setUpRelatedUom(selectedItem, itemFormGroup);
    }
  }

  setUpRelatedUom(selectedItem: any, formGroup: FormGroup, isEdit?: boolean) {
    console.log(selectedItem);
    let itemArray: any[] = [];
    const uomControl = formGroup.controls.item_uom_id;
    const baseUomFilter = this.uoms.filter(
      (item) => item.id == parseInt(selectedItem?.lower_unit_uom_id)
    );
    let secondaryUomFilterIds = [];
    let secondaryUomFilter = [];
    if (selectedItem?.item_main_price && selectedItem?.item_main_price?.length) {
      selectedItem?.item_main_price.forEach((item) => {
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
    if (selectedItem?.is_free) {
      itemArray = selectedItem.item_uom ? [selectedItem.item_uom] : [selectedItem.uom_info];
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

  }

  public postFinalOrder(target: string): void {
    const totalStats = {};
    Object.keys(this.orderFinalStats).forEach((key: string) => {
      totalStats[key] = this.orderFinalStats[key].value;
    });
    let body = this.orderFormGroup.value;
    body.salesman_id = body.salesman_id[0]?.id
    const finalPayload = {
      customer_id: this.customerFormControl.value.user_id,
      lob_id: this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || "",
      ...body,
      ...totalStats,
      order_number: this.orderNumber,

      source: 3,
    };
    // this.payloadItems.forEach((item) => {
    //   item.is_free = false;
    //   item.is_item_poi = false;
    // });
    finalPayload.items = this.payloadItems;
    finalPayload['total_qty'] = finalPayload.items.length;

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
    this.finalOrderPayload['customer_lop'] = this.customerLPOFormControl.value;

    this.makeOrderPostCall(target);
  }

  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    if (this.isEditForm || this.isDeliveryForm) {
      return formArray;
    }
    const group = this.createItemFormGroup(null);
    formArray.push(group);
    return formArray;
  }

  private addItemFilterToControl(index: number, is_free?): void {
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
          // this.itemfilterValue = res || "";
          // this.itempage = 1;
          // this.items = [];
          // this.filteredItems = [];
          // this.isLoading = true;
          // this.itemlookup$.next(this.itempage)
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
              item_id: +result.item.id,
              item_uom_id: +result.item_uom_id,
              item_qty: result.item_qty,
              customer_id: this.isDepotOrder
                ? ''
                : (this.customerFormControl.value?.id || this.customerFormControl.value?.user_id),
              lob_id: this.isDepotOrder
                ? ''
                : (this.customerLobFormControl.value[0] && this.customerLobFormControl.value[0].id || ""),
              depot_id: this.isDepotOrder ? this.depotFormControl.value : '',
            };
            if (!this.freeItems && !this.noFirstReqInEdit) {
              if (body.item_qty > 0) {
                if (!body.item_id) return;
                this.getPromotion(result);
                this.subscriptions.push(
                  this.orderService.getOrderItemStats(body).subscribe(
                    (stats) => {
                      this.payloadItems[groupIndex] = this.setupPayloadItemArray(
                        newFormGroup,
                        stats.data
                      );
                      this.generateOrderFinalStats(false, false);
                    },
                    (error) => {
                      console.error(error);
                    }
                  )
                );
              } else {
                this.CommonToasterService.showWarning(
                  'Item QTY should atleast be 1'
                );
                this.payloadItems[groupIndex] = this.setupPayloadItemArray(
                  newFormGroup,
                  this.setupEmptyItemValue
                );
                this.generateOrderFinalStats(false, false);
              }
            } else {
              setTimeout(() => {
                this.freeItems = false;
                this.noFirstReqInEdit = false;
              }, 1000);
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

  fiterItems(value) {
    this.itemfilterValue = value || "";
    this.itempage = 1;
    this.items = [];
    this.filteredItems = [];
    this.isLoading = true;
    this.itemlookup$.next(this.itempage)
  }

  private setupDueDate(): void {
    const date = this.deliveryDateFormControl.value;
    const selectedTerm = this.terms.find(
      (term: PaymentTerms) => term.id === this.selectedPaymentTermId
    );
    var new_date = moment(date ? date : new Date())
      .add(selectedTerm.number_of_days, 'days')
      .format('YYYY-MM-DD');
    this.dueDateFormControl.setValue(new_date);
  }

  private filterItems(itemName: string): Item[] {
    const filterValue = itemName.toLowerCase();
    return this.items.filter((item) =>
      item.item_name.toLowerCase().includes(filterValue) ||
      item.item_code.toLowerCase().includes(filterValue)
    );
  }

  filterCustomers(customerName?: string, search = false) {
    this.isLoading = true;
    this.customers = [];
    this.filterCustomer = [];
    this.filterValue = customerName?.toLowerCase() || "";
    this.page = 1;
    this.lookup$.next(this.page)
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
    if (this.salesmanFormControl.invalid) {
      Utils.setFocusOn('salesmanFormField');
      return false;
    }
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
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  setOrderNumber(value) {
    //console.log(value);
    this.orderNumber = value;
  }

  private sumUpFinalStats(
    item: OrderItemsPayload,
    isForDelivery?: boolean
  ): void {
    if (isForDelivery) {
      this.deliveryFinalStats.total_gross.value =
        this.deliveryFinalStats.total_gross.value + +item.item_grand_total;
      this.deliveryFinalStats.total_vat.value =
        this.deliveryFinalStats.total_vat.value + +item.item_vat;
      this.deliveryFinalStats.total_excise.value =
        this.deliveryFinalStats.total_excise.value + +item.item_excise;
      this.deliveryFinalStats.total_net.value =
        this.deliveryFinalStats.total_net.value + +item.item_net;
      this.deliveryFinalStats.total_discount_amount.value =
        this.deliveryFinalStats.total_discount_amount.value +
        +item.item_discount_amount;
      this.deliveryFinalStats.grand_total.value =
        this.deliveryFinalStats.grand_total.value + +item.item_grand_total;
      return;
    }

    this.orderFinalStats.total_gross.value =
      this.orderFinalStats.total_gross.value + +item.item_grand_total;
    this.orderFinalStats.total_vat.value =
      this.orderFinalStats.total_vat.value + +item.item_vat;
    this.orderFinalStats.total_excise.value =
      this.orderFinalStats.total_excise.value + +item.item_excise;
    this.orderFinalStats.total_net.value =
      this.orderFinalStats.total_net.value + +item.item_net;
    this.orderFinalStats.total_discount_amount.value =
      this.orderFinalStats.total_discount_amount.value +
      +item.item_discount_amount;
    this.orderFinalStats.grand_total.value =
      this.orderFinalStats.grand_total.value + +item.item_grand_total;
  }

  private setupPayloadItemArray(
    form: FormGroup,
    result?: any,
  ): OrderItemsPayload {
    return {
      item: form.controls.item.value,
      item_id: form.controls.item.value.id,
      item_code: form.controls.item.value?.item_code || '',
      item_qty: form.controls.item_qty.value,
      item_uom_id: form.controls.item_uom_id.value,
      discount_id: result && result.discount_id ? result.discount_id : null,
      promotion_id: result && result.promotion_id ? result.promotion_id : null,
      is_free: form.controls.is_free.value || result?.is_free,
      is_item_poi: result?.is_item_poi || false,
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
    this.orderData.items.forEach((item, i) => {
      if (item.item.id == items.value.item.id) {
        ordStatus = item.order_status;
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
      case OrderUpdateProcess.InProcess:
        status = false;
        break;
      case OrderUpdateProcess.Accept:
        status = true;
        break;
      case OrderUpdateProcess.Delivered:
        status = true;
        break;
      case OrderUpdateProcess.Completed:
        status = true;
        break;
    }
    return status;
  }

  private makeOrderPostCall(target: string): void {
    if (!this.checkFormValidation()) {
      return;
    }

    if (target === 'delivery') {
      this.subscriptions.push(
        this.orderService.addNewOrder(this.finalOrderPayload).subscribe(
          (result1) => {
            this.CommonToasterService.showSuccess(
              '',
              'Order has been successfuly added. Converting order to delivery.'
            );
            this.router.navigate([
              'transaction/order/start-delivery',
              result1.data.uuid,
            ]);
          },
          (error) => {
            this.CommonToasterService.showError(
              'Failed adding order',
              'Cannot add order, please try again'
            );
            this.router.navigate(['transaction/order/add']);
          }
        )
      );
    } else if (target === 'order') {
      if (this.isEditForm) {
        this.finalOrderPayload.items.forEach((item) => {
          let newitem = JSON.parse(JSON.stringify(item['item']));
          // console.log(newitem);
          // item.item.item_code = undefined;
          // console.log(newitem);
          item['item_code'] = newitem.item_code;
          item['promotion_id'] = null;

        });
        this.subscriptions.push(
          this.orderService
            .editOrder(this.orderData.uuid, this.finalOrderPayload)
            .subscribe(
              (result) => {
                this.CommonToasterService.showSuccess(
                  '',
                  'Order has been updated successfully'
                );
                this.router.navigate(['transaction/order']);
              },
              (error) => {
                this.CommonToasterService.showError(
                  'Failed updating order',
                  'Please try again'
                );
              }
            )
        );
      } else {
        this.subscriptions.push(
          this.orderService.addNewOrder(this.finalOrderPayload).subscribe(
            (result) => {
              this.CommonToasterService.showSuccess(
                'Order added',
                'Order has been added successfully'
              );
              this.router.navigate(['transaction/order']);
            },
            (error) => {
              this.CommonToasterService.showError(
                'Failed adding order',
                'Please try again'
              );
              this.router.navigate(['transaction/order/add']);
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

  openBulkItemSelectionPopup() {
    this.dialogRef.open(BulkItemModalComponent, {
      width: '900px',
      data: { title: `Are you sure want to delete this Salesman ?` }
    }).afterClosed().subscribe(data => {
      if (data.length > 0) {
        const itemControls = this.orderFormGroup.get('items') as FormArray;
        data.forEach(element => {
          const added = itemControls.value.find(
            (item) => item.item.id === element.item_id && item.is_free == true
          );
          this.freeItems = true;
          if (added) return;
          element.name = element.item_name;
          element.item_price = element?.lower_unit_item_price;
          // element.discount = Number(element?.quantity || 0) * Number(element?.lower_unit_item_price);
          element.item_qty = Number(element?.quantity || 0);
          element['is_free'] = false;
          this.addBulkItemForm(element);
          let item = { id: element.id, name: element.name };
          this.setItemBulk(element, itemControls.value.length - 1, true);
          const newFormGroup = itemControls.controls[itemControls.value.length - 1] as FormGroup;
          this.payloadItems[itemControls.value.length - 1] = this.setupPayloadItemArray(
            newFormGroup,
            element
          );
        });
      }
    });
  }
  public addBulkItemForm(item?: OrderItemsPayload): void {
    const itemControls = this.orderFormGroup.controls['items'] as FormArray;
    let group = this.createItemFormGroup(item, true);
    itemControls.push(group);
    this.addItemFilterToControl(itemControls.controls.length - 1, true);
  }
  public setItemBulk(data: any, index: number, isFromEdit?: boolean): void {


    this.itemfilterValue = '';
    // const selectedItem = this.items.find(
    //   (item: Item) => item.id === data.item_id
    // );
    let selectedItem = data;
    selectedItem['lower_unit_uom_id'] = data?.item_uom_lower_unit?.id || 0;
    selectedItem['item_main_price'] = data?.item_main_price || [];
    const itemFormGroup = this.itemFormControls[index] as FormGroup;
    // const uomControl = itemFormGroup.controls.item_uom_id;
    // let IsEdit = true;
    // if (selectedItem?.is_free) {
    //   IsEdit = false
    // }
    setTimeout(() => {
      this.setUpRelatedUomBulk(selectedItem, itemFormGroup);
    }, 1000);


  }

  setUpRelatedUomBulk(selectedItem: any, formGroup: FormGroup) {
    console.log(selectedItem);
    const uomControl = formGroup.controls.item_uom_id;
    const baseUomFilter = this.uoms.filter(
      (item) => item.id == parseInt(selectedItem?.lower_unit_uom_id)
    );
    let secondaryUomFilter = [];
    if (selectedItem?.item_uom_list && selectedItem?.item_uom_list?.length) {


      formGroup.controls.item_uom_list.setValue(selectedItem?.item_uom_list);
      if (selectedItem?.selected_item_uom) {
        setTimeout(() => {
          uomControl.setValue(selectedItem?.selected_item_uom);
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

    }
  }
}

export const ITEM_ADD_FORM_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#', show: true },
  { id: 1, key: 'item', label: 'Item Code', show: true },
  { id: 2, key: 'itemName', label: 'Item Name', show: true },
  { id: 3, key: 'uom', label: 'UOM', show: true },
  { id: 4, key: 'qty', label: 'Quantity', show: true },
  { id: 5, key: 'price', label: 'Price', show: true },
  { id: 6, key: 'discount', label: 'Discount', show: true },
  { id: 7, key: 'vat', label: 'Vat', show: true },
  { id: 8, key: 'net', label: 'Net', show: true },
  { id: 9, key: 'excise', label: 'Excise', show: true },
  { id: 10, key: 'total', label: 'Total', show: true },
];

