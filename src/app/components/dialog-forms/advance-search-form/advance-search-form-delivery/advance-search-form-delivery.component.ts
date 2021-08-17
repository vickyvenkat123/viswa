import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS, DELIVERY_STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-delivery',
  templateUrl: './advance-search-form-delivery.component.html',
  styleUrls: ['./advance-search-form-delivery.component.scss']
})
export class AdvanceSearchFormDeliveryComponent implements OnInit {
  statusList:Array<any>=DELIVERY_STATUS;
  @Input() salesman:Array<any>=[]
  form:FormGroup
  constructor() { }

  ngOnInit(): void {
    this.form=new FormGroup({
      module:new FormControl('delivery'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      order_no: new FormControl(),
      customerName: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      current_stage: new FormControl(),
    })
  }

}
