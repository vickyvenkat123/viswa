import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
export interface PeriodicElement {
  Invoice: number;
  customerCode: string;
  customername: string;
  FOCPC5: number;
  FocVal: number;
}

@Component({
  selector: 'app-add-foc',
  templateUrl: './add-foc.component.html',
  styleUrls: ['./add-foc.component.scss']
})
export class AddFocComponent implements OnInit {
  @Input() routeId: any;
  @Input() date: any;
  public foc_data = [];
  displayedColumns: string[] = ['Invoice', 'customer Code', 'customer name', 'FOC QTY', 'Foc UOM']
  ELEMENT_DATA: any = [
    { Invoice: 12345, customerCode: "test", customername: "test", FOCPC5: 1234, FocVal: 1234 }
  ];
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getInvoiceFormData();
  }
  getInvoiceFormData() {
    this.apiService.getInvoiceVisitItem(this.routeId, 'foc', this.date).subscribe((res) => {
      this.foc_data = res['data'];
      console.log('Invoice Data', this.foc_data);
    })
  }

}
