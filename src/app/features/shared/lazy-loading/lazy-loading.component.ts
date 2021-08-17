import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-lazy-loading',
  templateUrl: './lazy-loading.component.html',
  styleUrls: ['./lazy-loading.component.scss']
})
export class LazyLoadingComponent implements OnInit {
  @Output() public selectionchanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() public onFetch: EventEmitter<any> = new EventEmitter<any>();
  @Input() control;
  @Input() id;
  @Input() name;
  @Input() param1;
  @Input() param2;
  @Input() text;
  @Input() objectName;
  @Input() options: any[];
  @Input() isSingle;
  readonly bufferSize: number = 10;

  itemList = [];
  selectedItems = [];
  settings: any = {};
  loading = false;
  indices: any;
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options.currentValue != changes.options.previousValue) {
      this.options = this.options?.map(x => {
        let value = '';
        if (this.objectName == 'root') {
          value = x[this.param1];
        } else if (this.objectName == 'user-root') {
          console.log(x);
          value = x[this.param1] + ' ' + x[this.param2];
        } else if (this.objectName == 'code-root') {
          value = x[this.param1] + ' - ' + x[this.param2];
        } else if (this.objectName == 'country-root') {
          value = x.user.firstname + ' ' + x.user.lastname;
        }
        else if (this.objectName == 'salesman-root') {
          if (x.salesman_code) {
            value = x.user.firstname + ' ' + x.user.lastname + ' - ' + x.salesman_code;
          }
          else {
            value = x.user.firstname + ' ' + x.user.lastname + ' - ';
          }
        } else if (this.objectName == 'customer-root') {
          value = x?.firstname + ' ' + x?.lastname + ' - ' + x?.customer_info?.customer_code
        }
        else if (this.objectName) {
          if (x[this.objectName]) {
            value = x[this.objectName][this.param1] + ' ' + (x[this.objectName][this.param2] || '');
          } else {
            value = "N/A";
          }

        } else {
          value = x[this.text];
        }
        if (this.objectName == "salesman-root") {
          return {
            id: x.user.id, itemName: value
          }
        } else {
          return {
            id: x[this.id], itemName: value
          }
        }
      })
      // this.getNextItem();
    }
  }

  ngOnInit() {
    this.itemList = [];

    this.settings = {
      text: "Select Options",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      classes: "myclass custom-class",
      enableSearchFilter: true,
      searchBy: ['itemName'],
      lazyLoading: true,
      badgeShowLimit: 3,
      singleSelection: this.isSingle == 'true' ? true : false,
    };

    console.log(this.settings, "ngOnInit");
  }
  onScroll(e: any) {
    this.loading = true;
    console.log(e);
    this.getNextItem();
    if (this.itemList.length == this.options.length) {
      this.loading = false;
    }
  }
  onOpen(ev) {
    this.loading = true;
    console.log(this.itemList);
    this.getNextItem();
    if (this.itemList.length == this.options.length) {
      this.loading = false;
    }
  }
  chunkArray(myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    var tempArray1 = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
      tempArray1 = myArray.slice(index, index + chunk_size);
      // Do something if you want with the group
      tempArray.push(tempArray1);
    }

    return tempArray;
  }
  fetchMore(event: any) {
    this.getNextItem();
    if (this.itemList.length == this.options.length) {
      this.loading = false;
    }
  }
  getNextItem(): boolean {
    if (this.itemList.length >= this.options.length) {
      return false;
    }
    const remainingLength = Math.min(10, this.options.length - this.itemList.length);
    this.itemList.push(...this.options.slice(this.itemList.length, this.itemList.length + remainingLength));
    console.log(this.itemList.length);
    if (this.itemList.length == this.options.length) {
      this.loading = false;
    }
  }
  onItemSelect(item: any) {
    if (this.settings?.singleSelection) {
      this.control.setValue([item]);
    } else {
      var list = this.control.value;
      this.control.setValue([...list, item]);
      this.selectedItems = [...list, item];
    }
    this.selectionchanged.emit();

  }
  OnItemDeSelect(item: any) {
    this.control.setValue([item]);
    this.selectionchanged.emit();
  }
  onSelectAll(items: any) {
    this.control.setValue(items);
    this.selectionchanged.emit();
  }
  onDeSelectAll(items: any) {
    this.control.setValue(items);
    this.selectionchanged.emit();
  }
  changeData() {
    this.selectedItems = [];
  }

}
