import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  OnChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';


import { startWith, map } from 'rxjs/operators';
import { getLocaleNumberSymbol } from '@angular/common';
import { MasterService } from 'src/app/components/main/master/master.service';
import { Subject } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';

@Component({
  selector: 'app-promotion-form-offer-item',
  templateUrl: './promotion-form-offer-item.component.html',
  styleUrls: ['./promotion-form-offer-item.component.scss'],
})
export class PromotionFormOfferItemComponent implements OnInit, OnChanges {
  @Input() public overviewFormGroup: FormGroup;
  @Input() public offerItems: any[];

  data: OfferData[] = [{ item_id: '', item_uom_id: '', offered_qty: '' }];
  uoms: any;

  uomArray: any[] = [];
  control = new FormControl();
  items: any[] = [];
  itemsBuffer = [];
  bufferSize = 50;
  numberOfItemsFromEndBeforeFetchingMore = 10;
  loading = false;
  // items: any[] = [
  //   { item_name: 'a item1', id: 1 },
  //   { item_name: 'b item2', id: 2 },
  //   { item_name: 'c item3', id: 3 },
  //   { item_name: 'd item4', id: 4 },
  // ];
  selectedItem;
  filteredItemNames: Observable<any>[] = [];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  displayColumns = ['itemName', 'uom', 'offeredQty', 'action'];
  rows: FormArray = this.fb.array([]);
  offerItemFormGroup: FormGroup = this.fb.group({
    offerItemFormArray: this.rows,
  });
  public itemlookup$: Subject<any> = new Subject();
  itempage: number = 1;
  item_total_pages: number = 0;
  itemfilterValue: string = "";

  constructor(private fb: FormBuilder, private apiService: ApiService, private masterService: MasterService) { }

  ngOnInit() {
    this.data.forEach((d: OfferData) => this.addRow(d, false));
    this.updateView();
    this.apiService.getAllItemUoms().subscribe((uoms) => {
      this.uoms = uoms.data;
    });

    this.overviewFormGroup.addControl('offerItems', this.rows);
    this.getItems();
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
  getItemList() {
    this.items.forEach((element, i) => {
      element['item_val'] = element.item_name + ' - ' + element.item_code
    });
  }
  ngOnChanges() {
    if (this.offerItems) {
      this.uomArray = []
      this.rows.removeAt(0);
      this.offerItems.forEach(offerItem => {
        let row = this.fb.group({
          item_id: [offerItem.item_id],
          item_uom_id: [offerItem.item_uom_id],
          offered_qty: [offerItem.offered_qty],
        });
        this.rows.push(row);

        var obj = {
          "item_name": offerItem.item.item_name,
          "item_code": offerItem.item.item_code,
          "item_val": offerItem.item.item_name + ' - ' + offerItem.item.item_code,
          "id": offerItem.item_id
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

  addRow(d?: OfferData, noUpdate?: boolean) {
    const row = this.fb.group({
      // itemCode: [''],
      item_id: [''],
      item_uom_id: [''],
      offered_qty: [''],
    });
    this.rows.push(row);
    if (!noUpdate) {
      this.updateView();
    }
    this.uomArray.push([]);
    // this.manageNameControl(this.rows.length - 1);
  }
  deleteItem(index) {
    this.rows.removeAt(index);
    this.updateView();
    this.filteredItemNames.slice(index, 1);
    this.uomArray.splice(index, 1);
  }
  onItemChange(event, i) {
    this.itemfilterValue = "";
    this.itempage = 1;
    let filteredUOMs = [];
    if (event) {
      let secondaryUOMs = [];
      event?.item_main_price.forEach(uom => {
        if (uom?.item_uom) {
          secondaryUOMs.push(uom.item_uom);
        }
      })
      filteredUOMs = [...filteredUOMs, ...secondaryUOMs]
      if (event?.item_uom_lower_unit) {
        filteredUOMs.push(event?.item_uom_lower_unit)
      }

    }
    this.uomArray[i] = filteredUOMs;
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
      this.offerItemFormGroup.controls.offerItemFormArray['controls'][index]['controls']['price'].setValue(itemUOMObj.item_price)
    } else {
      this.offerItemFormGroup.controls.offerItemFormArray['controls'][index]['controls']['price'].setValue('')
    }
  }
}

export interface OfferData {
  // itemCode: any;
  item_id: any;
  item_uom_id: any;
  offered_qty: any;
}
export interface Item {
  item_name: string;
  id: string;
}
