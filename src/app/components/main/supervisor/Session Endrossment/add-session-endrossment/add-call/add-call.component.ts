import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
export interface PeriodicElement {
  categoryname: string;
  Scheduled: number;
  Visited: number;
  ScheduledSale: number;
  ScheduledNosale: number;
  UnscheduledNoSale: number;
  UnscannedCost: number;
  RoutetimeSendedInminute: number;
  cashSale: number;
  Creditsale: number;
}


@Component({
  selector: 'app-add-call',
  templateUrl: './add-call.component.html',
  styleUrls: ['./add-call.component.scss']
})
export class AddCallComponent implements OnInit {
  @Input() routeId: any;
  @Input() date: any;
  public call_data = [];
  displayedColumns: string[] = ['Scheduled', 'Visited', 'Scheduled Sale', 'Unscheduled Sale', 'cash Sale',
    'Credit sale'];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getInvoiceFormData();
  }
  getInvoiceFormData() {
    this.apiService.getInvoiceVisitItem(this.routeId, 'call', this.date).subscribe((res) => {
      this.call_data = res['data'];
    })
  }
}
