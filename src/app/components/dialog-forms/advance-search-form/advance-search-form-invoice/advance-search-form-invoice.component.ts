import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { STATUS, INVOICE_STATUS } from 'src/app/app.constant';

@Component({
  selector: 'app-advance-search-form-invoice',
  templateUrl: './advance-search-form-invoice.component.html',
  styleUrls: ['./advance-search-form-invoice.component.scss']
})
export class AdvanceSearchFormInvoiceComponent implements OnInit {
  form:FormGroup
  statusList:Array<any>=INVOICE_STATUS;
  @Input() salesman:Array<any>=[]
  constructor() { }

  ngOnInit(): void {
    this.form=new FormGroup({
      module:new FormControl('invoice'),
      startdate: new FormControl(),
      enddate: new FormControl(),
      invoice_no: new FormControl(),
      customerName: new FormControl(),
      startrange: new FormControl(),
      endrange: new FormControl(),
      salesman: new FormControl(),
      current_stage: new FormControl(),
    })
  }

}
