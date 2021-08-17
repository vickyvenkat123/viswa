import { FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
@Component({
  selector: 'app-multiautocomplete',
  templateUrl: './multiautocomplete.component.html',
  styleUrls: ['./multiautocomplete.component.scss']
})
export class MultiautocompleteComponent implements OnInit {
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
  @Input() disable;

  data = [];
  selectedItems = [];
  dropdownSettings;
  constructor() { }

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: this.isSingle == 'true' ? true : false,
      text: "Select Options",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      disabled: this.disable == 'true' ? true : false,
      badgeShowLimit: 2,
      lazyLoading: true
    };
  }

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
        else if (this.objectName == 'customer-root1') {
          value = x.itemName;
        }
        else if (this.objectName == 'code-root1') {
          value = x.itemName;
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
      });
    }
  }

  onItemSelect(item: any) {
    //console.log(item);
    //console.log(this.selectedItems);
    this.selectionchanged.emit();

  }
  OnItemDeSelect(item: any) {
    //console.log(item);
    //console.log(this.selectedItems);
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
}
