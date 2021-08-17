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
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { map, startWith } from 'rxjs/operators';
import { GrnItemsPayload, GrnModel } from '../grn-models';
import { MatSelectChange } from '@angular/material/select';
import { APP_CURRENCY_CODE } from 'src/app/services/constants';
import {
  ItemAddTableHeader,
  OrderItemsPayload,
  ApiItemPriceStats,
} from '../../../transaction/orders/order-models';
import { ItemUoms } from '../../../settings/item/item-uom/itemuoms-dt/itemuoms-dt.component';
import { Customer } from '../../../master/customer/customer-dt/customer-dt.component';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Utils } from 'src/app/services/utils';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import {
  getCurrency,
  getCurrencyDecimalFormat,
} from 'src/app/services/constants';
@Component({
  selector: 'app-grn-form',
  templateUrl: './grn-form.component.html',
  styleUrls: ['./grn-form.component.scss'],
})
export class GrnFormComponent implements OnInit, OnDestroy {
  public pageTitle: string;
  public isEditForm: boolean;
  public uuid: string;
  public isDepotOrder: boolean;
  public grnNumber: string;
  public nextOrderNumber: string;
  public orderData: GrnModel;
  public objectValues = Object.values;
  public currencyCode = getCurrency();
  public currencyDecimalFormat = getCurrencyDecimalFormat();
  // public orderFinalStats: { [key: string]: { label: string; value: number; } } = {
  //   gross_total: { label: 'Gross Total', value: 0 },
  //   total_vat: { label: 'Vat', value: 0 },
  //   total_excise: { label: 'Excise', value: 0 },
  //   total_net: { label: 'Net Total', value: 0 },
  //   total_discount_amount: { label: 'Discount', value: 0 },
  //   grand_total: { label: 'Total', value: 0 }
  // };
  // public deliveryFinalStats: { [key: string]: { label: string; value: number; } } = {
  //   gross_total: { label: 'Gross Total', value: 0 },
  //   total_vat: { label: 'Vat', value: 0 },
  //   total_excise: { label: 'Excise', value: 0 },
  //   total_net: { label: 'Net Total', value: 0 },
  //   total_discount_amount: { label: 'Discount', value: 0 },
  //   grand_total: { label: 'Invoice Total', value: 0 }
  // };

  public grnFormGroup: FormGroup;
  public sourceFormControl: FormControl;
  public destinationFormControl: FormControl;
  public remarkFormControl: FormControl;
  public dateFormControl: FormControl;
  public numberFormControl: FormControl;
  public reasonFormControl: FormControl;

  public currentDate: any;

  public itemTableHeaders: ItemAddTableHeader[] = [];
  public returnReasons: { id: number; name: string }[] = [];
  public items: Item[] = [];
  public filteredItems: Item[] = [];
  public uoms: ItemUoms[] = [];
  public payloadItems: GrnItemsPayload[] = [];
  public warehouses: {
    id: number;
    name: string;
  }[] = [];

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  public selectedSourceWarehouseId: any[] = [];
  public selectedDestWarehouseId: any[] = [];
  public grnData: GrnModel;
  public grnAdjstDetailCount: number = 0;
  public grnAdjstItemid: number[] = [];
  private router: Router;
  private apiService: ApiService;
  private dataService: DataEditor;
  private subscriptions: Subscription[] = [];
  private itemNameSubscriptions: Subscription[] = [];
  private itemControlSubscriptions: Subscription[] = [];
  private route: ActivatedRoute;
  private formBuilder: FormBuilder;
  private dialogRef: MatDialog;
  private elemRef: ElementRef;
  private finalGrnPayload: any = {};
  public nextCommingNumberofOrderCode: string;
  nextCommingNumberofOrderCodePrefix: any;
  // private finalDeliveryPayload: any = {};

  constructor(
    apiService: ApiService,
    dataService: DataEditor,
    dialogRef: MatDialog,
    private CommonToasterService: CommonToasterService,
    elemRef: ElementRef,
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


    this.isEditForm = this.router.url.includes('inventory/grn/edit/');
    this.itemTableHeaders = ITEM_GRN_TABLE_HEADS;
    // this.selectedSourceWarehouseId = this.route.snapshot.data[
    //   'resolved'
    // ].warehouse.data;
    // this.selectedDestWarehouseId = this.route.snapshot.data[
    //   'resolved'
    // ].warehouse.data;
    this.apiService.getLocationStorageList().subscribe(warehosue => {
      this.selectedSourceWarehouseId = warehosue.data;
      this.selectedDestWarehouseId = warehosue.data;
    });
    this.sourceFormControl = new FormControl('', [Validators.required]);
    this.destinationFormControl = new FormControl('', [Validators.required]);
    this.remarkFormControl = new FormControl('', [Validators.required]);
    this.dateFormControl = new FormControl(this.currentDate, [Validators.required]);
    this.numberFormControl = new FormControl('', [Validators.required]);
    this.reasonFormControl = new FormControl('', [Validators.required]);

    this.grnFormGroup = this.formBuilder.group({
      source_warehouse: this.sourceFormControl,
      destination_warehouse: this.destinationFormControl,
      grn_remark: this.remarkFormControl,
      grn_date: this.dateFormControl,
      grn_number: this.numberFormControl.value,
      items: this.initItemFormArray(),
    });

    // this.items = this.route.snapshot.data['resolved'].items.data;
    // this.uoms = this.route.snapshot.data['resolved'].uoms.data;
    this.apiService.getAllItems().subscribe(items => {
      this.items = items.data;
    })
    this.apiService.getAllItemUoms().subscribe(uoms => {
      this.uoms = uoms.data;
    })

    if (this.isEditForm) {
      this.uuid = this.route.snapshot.params.uuid;
      this.pageTitle = 'Edit Goods Receipt Note';
      // this.grnData = this.route.snapshot.data['grn'].returndata;
      this.orderData = this.route.snapshot.data['grn'].returndata;
      this.setupEditFormControls(this.orderData);
    } else {
      this.pageTitle = 'Add Goods Receipt Note';
      this.addItemFilterToControl(0);
    }

    this.subscriptions.push(
      this.apiService.getWarehouses().subscribe((result) => {
        this.warehouses = result.data;
      })
    );

    this.subscriptions.push(
      this.apiService.getReturnReasonsType().subscribe((result) => {
        this.returnReasons = result.data.filter(x => x.type == "Bad Return Reason" || x.type == "Good Return Reason");
      })
    );

    if (!this.isEditForm) {
      this.getOrderCode();
      this.numberFormControl.enable();
    } else {
      this.numberFormControl.disable();
    }
  }

  public ngOnDestroy() {
    Utils.unsubscribeAll(this.subscriptions);
    Utils.unsubscribeAll(this.itemNameSubscriptions);
    Utils.unsubscribeAll(this.itemControlSubscriptions);
  }

  getOrderCode() {
    let nextNumber = {
      function_for: 'goodreceiptnote',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofOrderCode = res.data.number_is;
        this.nextCommingNumberofOrderCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofOrderCode) {
          this.numberFormControl.setValue(this.nextCommingNumberofOrderCode);
          this.numberFormControl.disable();
        } else if (this.nextCommingNumberofOrderCode == null) {
          this.nextCommingNumberofOrderCode = '';
          this.numberFormControl.enable();
        }
      } else {
        this.nextCommingNumberofOrderCode = '';
        this.numberFormControl.enable();
      }
    });
  }

  public openNumberSettings(): void {
    let data = {
      title: 'Good Recipt Note Code',
      functionFor: 'goodreceiptnote',
      code: this.nextCommingNumberofOrderCode,
      prefix: this.nextCommingNumberofOrderCodePrefix,
      key: this.nextCommingNumberofOrderCode.length ? 'autogenerate' : 'manual',
    };
    this.dialogRef
      .open(CodeDialogComponent, {
        width: '500px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        if (res.type == 'manual' && res.enableButton) {
          this.numberFormControl.setValue('');
          this.nextCommingNumberofOrderCode = '';
          this.numberFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          //this.grnNumber = res.data.next_coming_number_goodreceiptnote
          this.numberFormControl.setValue(
            res.data.next_coming_number_goodreceiptnote
          );
          this.nextCommingNumberofOrderCode =
            res.data.next_coming_number_goodreceiptnote;
          this.nextCommingNumberofOrderCodePrefix = res.reqData.prefix_code;
          this.numberFormControl.disable();
        }
      });
  }

  public setupEditFormControls(editData: any): void {
    const customer = this.isDepotOrder
      ? undefined
      : this.customers &&
      this.customers.find(
        (cust) => cust.id === editData.customer.customer_id
      );
    this.filteredCustomers.push(customer);

    // this.selectedSourceWarehouseId = editData.source_warehouse.warehouse.id;
    // this.selectedDestWarehouseId = editData.destination_warehouse.warehouse.id;
    let source_warehouse = [{ id: editData.source_warehouse?.id, itemName: editData.source_warehouse?.name }];
    let destination_warehouse = [{ id: editData.destination_warehouse?.id, itemName: editData.destination_warehouse?.name }];
    setTimeout(() => {
      this.sourceFormControl.setValue(source_warehouse);
      this.destinationFormControl.setValue(destination_warehouse);
    }, 1000);
    this.remarkFormControl.setValue(editData.grn_remark);
    this.dateFormControl.setValue(editData.grn_date);
    this.numberFormControl.setValue(editData.grn_number);
    this.grnAdjstDetailCount = editData.goodreceiptnotedetail.length;
    editData.goodreceiptnotedetail.forEach(
      (item: GrnItemsPayload, index: number) => {
        this.addItemForm(item);
        this.grnAdjstItemid.push(item.id);
        // const itemStats = this.payloadItems[index];
        // Object.keys(this.payloadItems[index]).forEach(key => {
        //   itemStats[key] = item[key];
        // });
      }
    );

    // Object.keys(this.orderFinalStats).forEach(key => {
    //   this.orderFinalStats[key].value = editData[key];
    // });
  }

  public addItemForm(item?: any): void {
    const itemControls = this.grnFormGroup.controls['items'] as FormArray;
    if (item) {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl(
            { id: item?.item.id, name: item?.item?.item_name, code: item?.item?.item_code },
            [Validators.required]
          ),
          item_name: new FormControl(item?.item?.item_name, [Validators.required]),
          item_uom_id: new FormControl(item.item_uom_id, [Validators.required]),
          reason: new FormControl(item.reason, [Validators.required]),
          qty: new FormControl(item.qty, [Validators.required]),
          item_code: new FormControl(item.item_code, [Validators.required]),
        })
      );
    } else {
      itemControls.push(
        this.formBuilder.group({
          item: new FormControl('', [Validators.required]),
          item_name: new FormControl('', [Validators.required]),
          item_uom_id: new FormControl(undefined, [Validators.required]),
          item_code: new FormControl(undefined, [Validators.required]),
          reason: new FormControl(undefined, [Validators.required]),
          qty: new FormControl(1, [Validators.required]),
        })
      );
    }

    this.addItemFilterToControl(itemControls.controls.length - 1);
  }

  public sourceChanged(data: MatSelectChange): void {
    this.selectedSourceWarehouseId = data.value;
    this.sourceFormControl.setValue(data.value);
  }

  public destinationChanged(data: MatSelectChange): void {
    this.selectedDestWarehouseId = data.value;
    this.destinationFormControl.setValue(data.value);
  }

  // public salesmanChanged(id: number): void {
  //   this.selectedDestWarehouseId = id;
  //   this.destinationFormControl.setValue(id);
  // }

  // public payTermChanged(id: number): void {
  //   this.selectedPaymentTermId = id;
  //   this.paymentTermFormControl.setValue(id);
  //   this.setupDueDate();
  // }

  // public addCustomer(): void {
  //   this.router.navigate([ 'masters/customer/add' ]);
  // }

  public goToGRNS(): void {
    this.router.navigate(['inventory/grn']);
  }

  // public addOrderType(): void {
  //   this.dialogRef.open(OrderTypeFormComponent, {
  //     width: '500px'
  //   }).afterClosed().subscribe(data => {
  //     //console.log(data);
  //   });
  // }

  public addItem(): void {
    this.addItemForm();
  }

  // public itemDidSelected(event: any, item: OrderItemsPayload): void {
  //   const isChecked = event.target.checked;
  //   const currentIndex = this.selectedPayloadItems.indexOf(item);
  //
  //   if (isChecked) {
  //     this.selectedPayloadItems.push(item);
  //   } else {
  //     this.selectedPayloadItems.splice(currentIndex, 1);
  //   }
  //
  //   this.generateOrderFinalStats(false, true);
  // }

  public getUomValue(item: OrderItemsPayload): string {
    const selectedUom = this.uoms.find(
      (uom) => uom.id.toString() === item.item_uom_id
    );

    return selectedUom ? selectedUom.name : '';
  }

  public get itemFormControls(): AbstractControl[] {
    const itemControls = this.grnFormGroup.get('items') as FormArray;

    return itemControls.controls;
  }

  public itemControlValue(item: Item): { id: string; name: string, item_code: string } {
    return { id: item.id, name: item.item_name, item_code: item.item_code };
  }

  public itemsControlDisplayValue(item?: {
    id: string;
    name: string;
    code: string;
  }): string | undefined {
    console.log('item', item);
    return item ? item.code ? item.code : '' + " " + item.name : undefined
  }

  public customerControlDisplayValue(customer: Customer): string {
    return customer
      ? `${customer.user.firstname} ${customer.user.lastname}`
      : '';
  }

  public deleteItemRow(index: number): void {
    const itemControls = this.grnFormGroup.get('items') as FormArray;
    // let selectedItemIndex: number;
    // let isSelectedItemDelete = false;

    // if (this.selectedPayloadItems.length) {
    //   const selectedItem = this.selectedPayloadItems.find((item: OrderItemsPayload, i: number) => item.item_id === itemControls.value[index].item.id);
    //   selectedItemIndex = this.selectedPayloadItems.indexOf(selectedItem);
    //   if (selectedItemIndex >= 0) {
    //     this.selectedPayloadItems.splice(selectedItemIndex, 1);
    //     isSelectedItemDelete = true;
    //   }
    // }

    itemControls.removeAt(index);

    this.itemNameSubscriptions.splice(index, 1);
    this.itemControlSubscriptions.splice(index, 1);
    this.payloadItems.splice(index, 1);
    // this.generateOrderFinalStats(true, isSelectedItemDelete);
  }

  public itemDidSearched(data: any, index: number): void {
    const selectedItem = this.items.find((item: Item) => item.id === data.id);
    const itemFormGroup = this.itemFormControls[index] as FormGroup;
    const uomControl = itemFormGroup.controls.item_uom_id;
    const itemCodeControl = itemFormGroup.controls.item_code;
    const itemNameControl = itemFormGroup.controls.item_name;
    const reasoneControl = itemFormGroup.controls.reason

    uomControl.setValue(selectedItem.lower_unit_uom_id);
    itemCodeControl.setValue(selectedItem.item_code);
    itemNameControl.setValue(selectedItem.item_name);

    this.updatePayloadItem(itemFormGroup, index);
  }

  public updatePayloadItem(itemFormGroup: FormGroup, index: number): void {
    const payloadItem: GrnItemsPayload = {
      item: itemFormGroup.value.item,
      item_code: itemFormGroup.value.item_code,
      item_id: itemFormGroup.value.item.id,
      item_qty: itemFormGroup.value.qty,
      item_uom_id: itemFormGroup.value.item_uom_id,
      reason: itemFormGroup.value.reason
    };

    this.payloadItems[index] = payloadItem;
  }

  public postFinalOrder(target: string): void {
    // const totalStats = {};
    // Object.keys(this.orderFinalStats).forEach((key: string) => {
    //   totalStats[key] = this.orderFinalStats[key].value;
    // });
    const finalPayload = {
      ...this.grnFormGroup.value,
    };
    const newpayload = [];

    this.payloadItems.forEach((result, i) => {
      const obj = {
        item: result.item,
        item_id: result.item.id,
        qty: result.item_qty,
        item_uom_id: result.item_uom_id,
        reason: result.reason
      };
      newpayload.push(obj);
    });

    finalPayload.items = newpayload;
    finalPayload['total_qty'] = finalPayload.items.length;

    this.finalGrnPayload = { ...finalPayload };
    this.finalGrnPayload.source_warehouse = this.finalGrnPayload.source_warehouse[0]?.id;
    this.finalGrnPayload.destination_warehouse = this.finalGrnPayload.destination_warehouse[0]?.id;
    // this.finalDeliveryPayload = { ...finalPayload };
    // this.finalDeliveryPayload.items = this.selectedPayloadItems.length ? this.selectedPayloadItems : this.payloadItems;

    // if (this.selectedPayloadItems.length) {
    //   Object.keys(this.deliveryFinalStats).forEach((key: string) => {
    //     this.finalDeliveryPayload[key] = this.deliveryFinalStats[key].value;
    //   });
    //   this.finalDeliveryPayload['total_qty'] = this.selectedPayloadItems.length;
    // }

    this.makeOrderPostCall(target);
  }

  private initItemFormArray(): FormArray {
    const formArray = this.formBuilder.array([]);

    if (this.isEditForm) {
      return formArray;
    }

    formArray.push(
      this.formBuilder.group({
        item: new FormControl('', [Validators.required]),
        item_name: new FormControl('', [Validators.required]),
        item_uom_id: new FormControl(undefined, [Validators.required]),
        reason: new FormControl(undefined, [Validators.required]),
        qty: new FormControl(1, [Validators.required]),
        item_code: new FormControl(undefined, [Validators.required]),
      })
    );
    return formArray;
  }

  private addItemFilterToControl(index: number): void {
    const itemControls = this.grnFormGroup.controls['items'] as FormArray;
    const newFormGroup = itemControls.controls[index] as FormGroup;

    this.itemNameSubscriptions.push(
      newFormGroup.controls['item'].valueChanges
        .pipe(
          startWith<string | Item>(''),
          map((value) => (typeof value === 'string' ? value : value.item_name || value.item_code)),
          map((value: string) => {
            return value ? this.filterItems(value) : this.items.slice();
          })
        )
        .subscribe((result: Item[]) => {
          this.filteredItems = result;
        })
    );

    this.payloadItems[index] = this.setupPayloadItemArray(newFormGroup);

    this.itemControlSubscriptions.push(
      newFormGroup.valueChanges.subscribe((result) => {
        const groupIndex = itemControls.controls.indexOf(newFormGroup);
        this.updatePayloadItem(newFormGroup, groupIndex);
      })
    );
  }

  // private setupDueDate(): void {
  //   const selectedTerm = this.terms.find((term: PaymentTerms) => term.id === this.selectedPaymentTermId);
  //   const newDate = formatDate(new Date(Date.now() + (selectedTerm.number_of_days * 86400000)), 'yyyy-MM-dd', 'en');
  //
  //   this.dateFormControl.setValue(newDate);
  // }

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
  //
  //   return this.customers.filter(customer => customer.user.firstname.toLowerCase().includes(filterValue) || customer.user.lastname.toLowerCase().includes(filterValue));
  // }

  public checkFormValidation(): boolean {
    // if (this.orderFormGroup.invalid) {
    //   const invalidControl = Object.keys(this.orderFormGroup.controls).find((key: string) => {
    //     return this.orderFormGroup.controls[key].invalid;
    //   });
    //   const invalidElem = this.elemRef.nativeElement.querySelector(`formControlName=${invalidControl}`);
    //   invalidElem.focus();
    //
    //   return;
    // }

    if (!this.isDepotOrder && this.sourceFormControl.invalid) {
      Utils.setFocusOn('sourceFormField');

      return false;
    }

    if (this.isDepotOrder && this.destinationFormControl.invalid) {
      Utils.setFocusOn('destFormField');

      return false;
    }

    if (this.dateFormControl.invalid) {
      Utils.setFocusOn('grnDate');

      return false;
    }

    return true;
  }

  // private generateOrderFinalStats(isDeleted?: boolean, isItemSelection?: boolean): void {
  //   if (isItemSelection) {
  //     Object.values(this.deliveryFinalStats).forEach(item => {
  //       item.value = 0;
  //     });
  //
  //     this.selectedPayloadItems.forEach((item: OrderItemsPayload) => {
  //       this.sumUpFinalStats(item, true);
  //     });
  //
  //     if (!isDeleted) {
  //       return;
  //     }
  //   }
  //
  //   Object.values(this.orderFinalStats).forEach(item => {
  //     item.value = 0;
  //   });
  //
  //   this.payloadItems.forEach((item: OrderItemsPayload) => {
  //     this.sumUpFinalStats(item);
  //   });
  // }

  // private sumUpFinalStats(item: OrderItemsPayload, isForDelivery?: boolean): void {
  //
  //   if (isForDelivery) {
  //     this.deliveryFinalStats.gross_total.value = this.deliveryFinalStats.gross_total.value + item.item_grand_total;
  //     this.deliveryFinalStats.total_vat.value = this.deliveryFinalStats.total_vat.value + item.item_vat;
  //     this.deliveryFinalStats.total_excise.value = this.deliveryFinalStats.total_excise.value + item.item_excise;
  //     this.deliveryFinalStats.total_net.value = this.deliveryFinalStats.total_net.value + item.item_net;
  //     this.deliveryFinalStats.total_discount_amount.value = this.deliveryFinalStats.total_discount_amount.value + item.item_discount_amount;
  //     this.deliveryFinalStats.grand_total.value = this.deliveryFinalStats.grand_total.value + item.item_grand_total;
  //
  //     return;
  //   }
  //
  //   this.orderFinalStats.gross_total.value = this.orderFinalStats.gross_total.value + item.item_grand_total;
  //   this.orderFinalStats.total_vat.value = this.orderFinalStats.total_vat.value + item.item_vat;
  //   this.orderFinalStats.total_excise.value = this.orderFinalStats.total_excise.value + item.item_excise;
  //   this.orderFinalStats.total_net.value = this.orderFinalStats.total_net.value + item.item_net;
  //   this.orderFinalStats.total_discount_amount.value = this.orderFinalStats.total_discount_amount.value + item.item_discount_amount;
  //   this.orderFinalStats.grand_total.value = this.orderFinalStats.grand_total.value + item.item_grand_total;
  // }

  private setupPayloadItemArray(
    form: FormGroup,
    result?: ApiItemPriceStats
  ): GrnItemsPayload {
    return {
      item: form.controls.item.value,
      item_id: form.controls.item.value.id,
      item_qty: form.controls.qty.value,
      item_uom_id: form.controls.item_uom_id.value,
      item_code: form.controls.item_code.value,
      reason: form.controls.reason.value
      // discount_id: result ? result.discount_id : null,
      // promotion_id: result ? result.promotion_id : null,
      // is_free: result ? result.is_free : false,
      // is_item_poi: result ? result.is_item_poi : false,
      // item_price: result ? Number(result.item_price) : 0,
      // item_discount_amount: result ? Number(result.discount) : 0,
      // item_vat: result ? Number(result.total_vat) : 0,
      // item_net: result ? Number(result.total_net) : 0,
      // item_excise: result ? Number(result.total_excise) : 0,
      // item_grand_total: result ? Number(result.total) : 0
    };
  }

  goBackToGRNList() {
    this.router.navigate(['inventory/grn']);
  };

  private makeOrderPostCall(target: string): void {
    var is_Check = [];
    is_Check = this.finalGrnPayload.items;
    var valueArr = is_Check.map(function (item) {
      return item.item_id;
    });
    var isDuplicate = valueArr.some(function (item, idx) {
      return valueArr.indexOf(item) != idx;
    });
    if (!isDuplicate) {
      if (
        this.finalGrnPayload.source_warehouse ==
        this.finalGrnPayload.destination_warehouse
      ) {
        this.CommonToasterService.showError(
          '',
          'Source Warehouse and Destination Warehouse cannnot be same'
        );
        return;
      } else {
        if (target === 'order') {
          if (this.isEditForm) {
            this.finalGrnPayload.items.forEach((item, i) => {
              if (i < this.grnAdjstDetailCount) {
                item['id'] = this.grnAdjstItemid[i];
              } else if (i > this.grnAdjstDetailCount - 1) {
                item['id'] = 0;
              }
            });
            this.finalGrnPayload['grn_number'] = this.numberFormControl.value;
            this.subscriptions.push(
              this.apiService
                .editGRN(this.orderData.uuid, this.finalGrnPayload)
                .subscribe((result) => {
                  this.CommonToasterService.showSuccess(
                    '',
                    'Edited Successfully!Please check the table'
                  );
                  //console.log('Order edited', result.data);
                  this.router.navigate(['inventory/grn']);
                })
            );
          } else {
            this.finalGrnPayload['grn_number'] = this.numberFormControl.value;
            this.subscriptions.push(
              this.apiService
                .addGRN(this.finalGrnPayload)
                .subscribe((result) => {
                  this.CommonToasterService.showSuccess(
                    '',
                    'Added Successfully!Please check the table'
                  );
                  //console.log('Order added', result.data);
                  this.router.navigate(['inventory/grn']);
                })
            );
          }
        }
      } //
    } else {
      this.CommonToasterService.showWarning('', 'Same Item cannot be placed');
      return;
    }
  }

  numberFormat(number) {
    return this.apiService.numberFormatType(number);
  }

  numberFormatWithSymbol(number) {
    return this.apiService.numberFormatWithSymbol(number);
  }
}

export const ITEM_GRN_TABLE_HEADS: ItemAddTableHeader[] = [
  { id: 0, key: 'sequence', label: '#' },
  { id: 1, key: 'item_code', label: 'Item Code' },
  { id: 2, key: 'item', label: 'Item Name' },
  { id: 3, key: 'uom', label: 'UOM' },
  { id: 4, key: 'qty', label: 'Qty' },
  { id: 5, key: 'reason', label: 'Reason' },
];
