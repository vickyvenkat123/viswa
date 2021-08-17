import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
export interface PeriodicElement {
  ItemCode: string;
  ItemDescription: string;
  Carryover: number;
}



@Component({
  selector: 'app-add-carryover',
  templateUrl: './add-carryover.component.html',
  styleUrls: ['./add-carryover.component.scss']
})
export class AddCarryoverComponent implements OnInit {
  @Input() routeId: any;
  @Input() date: any;
  public carryover_data = [];
  public transectionData = [];
  displayedColumns: string[] = ['Item Code', 'Item Name', 'Qty', 'Carry Over No']
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getInvoiceFormData();
  }
  getInvoiceFormData() {
    this.apiService.getInvoiceVisitItem(this.routeId, 'cov', this.date).subscribe((res) => {
      this.carryover_data = res['data'];
      this.getTransectionDeatils();
    })
  }
  getTransectionDeatils() {
    this.carryover_data.forEach(element => {
      if (element.unload_type == '4') {
        element.salesman_unload_detail.forEach(element1 => {
          if (element1.unload_type == '4') {
            element1.code = element.code;
            this.transectionData.push(element1);
          }
        });
      }
    });
  }

}
