import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { MasterService } from 'src/app/components/main/master/master.service';
import { ApiService } from 'src/app/services/api.service';
import { Subject } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';

@Component({
  selector: 'app-promotion-form-order-item',
  templateUrl: './promotion-form-order-item.component.html',
  styleUrls: ['./promotion-form-order-item.component.scss'],
})
export class PromotionFormOrderItemComponent implements OnInit, OnChanges {
  @Input() public overviewFormGroup: FormGroup;
  @Input() public orderItems: any[];

  data: ItemData[] = [
    { item_id: '', item_qty: '', item_uom_id: '', price: '' },
  ];
  uoms: any[];
  items: any[] = [];
  itemsBuffer = [];
  bufferSize = 50;
  numberOfItemsFromEndBeforeFetchingMore = 10;
  loading = false;
  itemsVal = [];
  itemLoading = false;
  uomArray: any[] = [];
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  displayColumns = ['itemDesc', 'quantity', 'uom', 'price', 'action'];
  rows: FormArray = this.fb.array([]);
  itempage: number = 1
  orderItemFormGroup: FormGroup = this.fb.group({
    orderItemFormArray: this.rows,
  });
  public itemlookup$: Subject<any> = new Subject();
  itemfilterValue: any = "";
  item_total_pages: any = 0;

  constructor(private fb: FormBuilder, private apiService: ApiService, private masterService: MasterService) { }

  ngOnInit() {
    this.data.forEach((d: ItemData) => this.addRow(d, false));
    this.updateView();
    this.apiService.getAllItemUoms().subscribe((uoms) => {
      this.uoms = uoms.data;
    });
    this.getItems();
    // this.subscriptions.push(
    // this.apiService.getMasterDataLists().subscribe((result: any) => {
    //   this.items = result.data.items;
    // })
    // );
    this.overviewFormGroup.addControl('orderItems', this.rows);

    this.itemlookup$
      .pipe(exhaustMap(() => {
        return this.masterService.itemDetailListTable({ item_name: this.itemfilterValue.toLowerCase(), page: this.itempage, page_size: 10 })
      }))
      .subscribe(res => {
        this.loading = false;
        this.item_total_pages = res.pagination?.total_pages

        if (this.itempage > 1) {
          this.items = [...this.items, ...res.data];
          this.getItemList();
          this.itemsBuffer = this.items;
        } else {
          this.items = res.data;
          this.getItemList();
          this.itemsBuffer = this.items;
        }
        this.itempage++;

      })
  }

  getItems() {
    this.masterService.itemDetailListTable({ page: this.itempage, page_size: 10 }).subscribe((items) => {
      this.loading = false;
      this.item_total_pages = items.pagination?.total_pages
      this.items = [...this.items, ...items.data];
      this.getItemList();
      this.itemsBuffer = this.items;
    });
  }

  getItemList() {
    this.items.forEach((element, i) => {
      element['item_val'] = element.item_name + ' - ' + element.item_code
    });
  }
  onScroll({ end }) {
    // if (this.loading || this.items.length <= this.itemsBuffer.length) {
    //   return;
    // }

    // if (end + this.numberOfItemsFromEndBeforeFetchingMore >= this.itemsBuffer.length) {
    //   this.fetchMore();
    // }
  }
  onScrollToEnd() {
    this.fetchMore();
  }
  private fetchMore() {

    this.itempage++;
    if (this.item_total_pages > this.itempage) {
      this.loading = true;
      this.itemlookup$.next();
    }
  }
  ngOnChanges() {
    if (this.orderItems) {
      this.rows.removeAt(0);
      this.orderItems.forEach(orderItem => {
        let row = this.fb.group({
          item_id: [orderItem.item_id],
          item_uom_id: [orderItem.item_uom_id],
          item_qty: [orderItem.item_qty],
          price: [orderItem.price]
        });
        this.rows.push(row);

        var obj = {
          "item_name": orderItem.item.item_name,
          "item_code": orderItem.item.item_code,
          "item_val": orderItem.item.item_name + ' - ' + orderItem.item.item_code,
          "id": orderItem.item_id
        }

        this.items.push(obj);
      })
      this.updateView();
    }
  }
  emptyTable() {
    while (this.rows.length !== 0) {
      this.rows.removeAt(0);
    }
  }

  addRow(d?: ItemData, noUpdate?: boolean) {
    const row = this.fb.group({
      item_id: [d && d.item_id ? d.item_id : null, []],
      item_qty: [d && d.item_qty ? d.item_qty : null, []],
      item_uom_id: [d && d.item_uom_id ? d.item_uom_id : null, []],
      price: [d && d.price ? d.price : null, []],
    });
    this.rows.push(row);
    if (!noUpdate) {
      this.updateView();
    }
    this.uomArray.push([]);
    this.overviewFormGroup.addControl('orderItems', this.rows);
  }
  deleteItem(index) {
    this.rows.removeAt(index);
    this.updateView();
    this.uomArray.splice(index, 1);
    this.overviewFormGroup.addControl('orderItems', this.rows);
  }
  onItemChange(event, i) {
    this.itemfilterValue = "";
    this.itempage = 1;
    let filteredUOMs = [];
    if (event) {
      console.log(event);
      let secondaryUOMs = [];
      event?.item_main_price.forEach(uom => {
        if (uom?.item_uom) {
          uom.item_uom['item_price'] = uom.item_price;
          secondaryUOMs.push(uom.item_uom);
        }
      })
      filteredUOMs = [...filteredUOMs, ...secondaryUOMs]
      if (event?.item_uom_lower_unit) {
        filteredUOMs.push(event?.item_uom_lower_unit)
      }

    }
    console.log(filteredUOMs, i);
    this.uomArray[i] = filteredUOMs;
    this.orderItemFormGroup.controls.orderItemFormArray['controls'][i]['controls']['price'].setValue('')
    this.orderItemFormGroup.controls.orderItemFormArray['controls'][i]['controls']['item_uom_id'].setValue('')
  }
  updateView() {
    this.dataSource.next(this.rows.controls);
  }
  isFirstRow(index) {
    if (index === 0) {
      return true;
    } else {
      return false;
    }
  }
  searchItem(value) {
    this.itemfilterValue = value.term;
    this.itempage = 1;
    this.itemlookup$.next();
  }

  clearItemSearch() {
    this.itemfilterValue = "";
    this.itempage = 1;
    this.itemlookup$.next();
  }
  onChangeItemUOM(event, index) {
    var itemUOMs = this.uomArray[index];
    var itemUOMObj = itemUOMs.find(x => x.id == event.target.value)
    if (itemUOMObj.item_price) {
      this.orderItemFormGroup.controls.orderItemFormArray['controls'][index]['controls']['price'].setValue(itemUOMObj.item_price)
      // console.log("this.orderItemFormGroup.value.orderItemFormArray[index]", this.orderItemFormGroup.controls.orderItemFormArray[index])
    } else {
      this.orderItemFormGroup.controls.orderItemFormArray['controls'][index]['controls']['price'].setValue('')

    }
  }
}

export interface ItemData {
  item_id: any;
  item_qty: any;
  item_uom_id: any;
  price: any;
}
