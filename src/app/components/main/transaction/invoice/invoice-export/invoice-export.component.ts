import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { InvoiceServices } from '../invoice.service';

@Component({
  selector: 'app-invoice-export',
  templateUrl: './invoice-export.component.html',
  styleUrls: ['./invoice-export.component.scss']
})
export class InvoiceExportComponent implements OnInit {

  pipe = new DatePipe('en-US');
  public exportForm: FormGroup;
  public export: any = [];
  private apiService: ApiService;
  public invoiceServices: InvoiceServices;
  private datePipe: DatePipe

  constructor(datePipe: DatePipe,
    apiService: ApiService,
    invoiceServices: InvoiceServices) {
    Object.assign(this, { apiService, invoiceServices });
  }

  ngOnInit(): void {
    this.exportForm = new FormGroup({
      type: new FormControl(''),
      fileType: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl('')
    })

  }
  exportInvoice() {
    this.export.startDate = this.pipe.transform(this.export.startDate, 'yyyy-MM-dd');
    this.export.endDate = this.pipe.transform(this.export.endDate, 'yyyy-MM-dd');
    //console.log(this.export);
    let type = this.export.fileType;
    if (type === 'csv') {
      type = 'file.csv';
    } else {
      type = 'file.xls';
    }
    this.invoiceServices.exportInvoice({
      module: 'invoice',
      criteria: this.export.type,
      start_date: this.export.startDate,
      end_date: this.export.endDate,
      file_type: this.export.fileType,
      is_password_protected: 'no'
    })
      .subscribe(
        (result: any) => {
          if (result.status) {
            //console.log(result);
            this.apiService.downloadFile(result.data.file_url, type);
          }
        }
      );
  }


}
