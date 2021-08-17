import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS, ORDER_STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-order',
  templateUrl: './advance-search-form-order.component.html',
  styleUrls: ['./advance-search-form-order.component.scss']
})
export class AdvanceSearchFormOrderComponent implements OnInit {
  statusList: Array<any> = ORDER_STATUS;
  @Input() salesman: Array<any> = [];
  domain = window.location.host.split('.')[0];
  form: FormGroup
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      module: new FormControl('order'),
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
