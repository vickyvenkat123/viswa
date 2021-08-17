import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
export interface PeriodicElement {
  customername: string;
  customerCode: string;
  Date: string;
  invoice: string;
  category: string;
}

@Component({
  selector: 'app-add-invoice-form',
  templateUrl: './add-invoice-form.component.html',
  styleUrls: ['./add-invoice-form.component.scss']
})
export class AddInvoiceFormComponent implements OnInit {
  @Input() routeId: any;
  @Input() date: any;

  public invoiceData = [];
  displayedColumns: string[] = ['Customer Code', 'Customer Name', 'Invoice', 'Gross', 'Discount', 'Net', 'Vat', 'Total'];
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getInvoiceFormData();
  }

  getInvoiceFormData() {
    this.apiService.getInvoiceVisitItem(this.routeId, 'invoice', this.date).subscribe((res) => {
      this.invoiceData = res['data'];
    })
  }
}
