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
  selector: 'app-product-summary-by-customer-sales',
  templateUrl: './product-summary-by-customer-sales.component.html',
  styleUrls: ['./product-summary-by-customer-sales.component.scss']
})
export class ProductSummaryByCustomerSalesComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['customer_code', 'customer_name', 'item_code', 'item_name', 'total_sales', 'total_net', 'total_return', 'return_percent'];
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
          console.log(value);
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
      // Find the selected control and reset its value only (not others)
      // this.filterForm.patchValue({ date: null })
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

        var model: ProductSummaryByCustomerSalesModel = {
          customer_code: obj?.customer_info_details && obj?.customer_info_details?.customer_code,
          customer_name: obj.customer_info_details && `${obj?.customer_info_details?.user?.firstname} ${obj?.customer_info_details?.user?.lastname}`,
          item_code: obj.invoicedetail && obj.invoicedetail.length > 0 ? obj.invoicedetail[0].item.item_code : null,
          item_name: obj.invoicedetail && obj.invoicedetail.length > 0 ? obj.invoicedetail[0].item.item_name : null,
          total_net: obj.invoicedetail && obj.invoicedetail.length > 0 ? obj.invoicedetail[0].cat_total_net : null,
          total_sales: obj.invoicedetail && obj.invoicedetail.length > 0 ? obj.invoicedetail[0].cat_total_sales : null,
          return_percent: obj.invoicedetail && obj.invoicedetail.length > 0 ? obj.invoicedetail[0].return_percent : null,
          // total_return : obj.invoicedetail.length > 0 ? obj.invoicedetail[0].total_return : null,
        }
        this.productSummaryByCustomerSalesArr.push(model);
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
