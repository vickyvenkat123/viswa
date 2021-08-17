import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
export interface PeriodicElement {
  itemcode: number;
  itemdescription: string;
  CGname: string;
}

@Component({
  selector: 'app-add-routetransfer',
  templateUrl: './add-routetransfer.component.html',
  styleUrls: ['./add-routetransfer.component.scss']
})
export class AddRoutetransferComponent implements OnInit {
  @Input() routeId: any;
  @Input() date: any;
  public routtransferData = [];
  displayedColumns: string[] = ['itemcode', 'item name', 'Qty', 'Transfer Route']
  ELEMENT_DATA: any = [
    { itemcode: 12345, itemdescription: "test", CGname: "test" }

  ];
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    //this.getInvoiceFormData();
  }
  getInvoiceFormData() {
    this.apiService.getInvoiceVisitItem(this.routeId, 'invoice', this.date).subscribe((res) => {
      this.routtransferData = res['data'];
      console.log('Invoice Data', this.routtransferData);
    })
  }
}
