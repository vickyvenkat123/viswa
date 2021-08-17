import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { PricingPlanService } from '../../pricing-plan.service';

@Component({
  selector: 'app-pricing-export',
  templateUrl: './pricing-export.component.html',
  styleUrls: ['./pricing-export.component.scss']
})
export class PricingExportComponent implements OnInit {

  constructor(private apiService: ApiService,
    private pricingPlanService: PricingPlanService) { }

  ngOnInit(): void {
  }

  exportPricing(data) {

    let type = data.file_type;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.pricingPlanService.exportPromotion({
      module: 'pricing',
      criteria: data.criteria,
      start_date: data.start_date,
      end_date: data.end_date,
      file_type: data.file_type,
      is_password_protected: 'no'
    }).subscribe(
      (result: any) => {
        if (result.status) {
          //console.log(result);
          this.apiService.downloadFile(result.data.file_url, type);
        }
      }
    );
  }


}
