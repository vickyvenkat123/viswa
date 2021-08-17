import { ReportService } from './../report.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ProductSummaryByCustomerSalesModel } from 'src/app/interfaces/product-summary-by-customer-sales.interface';

@Component({
  selector: 'app-visit-analysis-by-vanor-salesman',
  templateUrl: './visit-analysis-by-vanor-salesman.component.html',
  styleUrls: ['./visit-analysis-by-vanor-salesman.component.scss']
})
export class VisitAnalysisByVanorSalesmanComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['route_code', 'route_name'];
  dateFilterControl: FormControl;
  selectedColumnFilter: string;

  filterForm: FormGroup;
  constructor(public fb: FormBuilder, private merService: ReportService, public dataEditor: DataEditor) {
    this.itemSource = new MatTableDataSource<any>();
  }

  productSummaryByCustomerSalesArr: Array<ProductSummaryByCustomerSalesModel> = [];
  requset;
  ngOnInit(): void {
    this.filterForm = this.fb.group({
      customer_code: [''],
      customer_name: [''],
      item_code: [''],
      item_name: [''],
      total_sales: [''],
      total_net: [''],
      total_return: [''],
      return_percent: [''],
    });
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA) {
          // this.data = value.data;
          this.requset = value.request;
          this.updateTableData(value.data);
        }
      })
    );
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(status) {
    if (!status) {
      this.filterForm.get(this.selectedColumnFilter).setValue(null);
    }
    this.filterData();
  }
  filterData() {
    let body = this.filterForm.value;
    Object.assign(body, this.requset);
    this.merService.getReportData(body).subscribe((res) => {
      if (res?.status == true) {
        this.dataEditor.sendData({
          type: CompDataServiceType.REPORT_DATA,
          request: this.requset,
          data: res.data,
        });
      }
    });
  }
  updateTableData(data = []) {
    this.productSummaryByCustomerSalesArr = [];
    if (data.length > 0) {
      data.map(obj => {


      });
    }
    this.itemSource = new MatTableDataSource<ProductSummaryByCustomerSalesModel>(this.productSummaryByCustomerSalesArr);
    this.itemSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

}
