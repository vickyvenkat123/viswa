import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-customer-download-dialog',
  templateUrl: './customer-download-dialog.component.html',
  styleUrls: ['./customer-download-dialog.component.scss'],
  providers: [DatePipe]
})
export class CustomerDownoadDialogComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = {};
  private apiService: ApiService;
  private datePipe: DatePipe

  constructor(datePipe: DatePipe,
    apiService: ApiService) {
    Object.assign(this, { apiService });
  }

  ngOnInit(): void {
    this.exportForm = new FormGroup({
      search_on: new FormControl(''),
      create_date_from: new FormControl(''),
      create_date_to: new FormControl(''),
      update_date_from: new FormControl(''),
      update_date_to: new FormControl('')
    })
  }

  exportCustomer() {
    this.export.create_date_from = this.pipe.transform(this.export.create_date_from, 'yyyy-MM-dd');
    this.export.create_date_to = this.pipe.transform(this.export.create_date_to, 'yyyy-MM-dd');

    this.export.update_date_from = this.pipe.transform(this.export.update_date_from, 'yyyy-MM-dd');
    this.export.update_date_to = this.pipe.transform(this.export.update_date_to, 'yyyy-MM-dd');
    
    this.apiService
      .getSalesmanData({
        type: 'customer',
        search_on: this.export.search_on,
        create_date_from: this.export.create_date_from,
        create_date_to: this.export.create_date_to,
        update_date_from: this.export.update_date_from,
        update_date_to: this.export.update_date_to
      })
      .subscribe(
        (result: any) => {
          if (result.status) {
            //console.log(result);	
            // this.apiService.downloadFile(result.data.file_url, type);
          }
        }
      );

      // let body = {
      //   type: 'customer',
      // };
      // this.apiService.getSalesmanData(body).subscribe(
      //   (res) => {
  
      //   })
  }

}
