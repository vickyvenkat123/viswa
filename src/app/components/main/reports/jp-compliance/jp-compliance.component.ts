import { DataEditor } from 'src/app/services/data-editor.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CompDataServiceType } from 'src/app/services/constants';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-jp-compliance',
  templateUrl: './jp-compliance.component.html',
  styleUrls: ['./jp-compliance.component.scss']
})
export class JpComplianceComponent implements OnInit {

  selectedColumnFilter: string;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  domain = window.location.host.split('.')[0];
  public displayedColumns = ['date', 'merchandiserCode', 'merchandiserName', 'journeyPlan', 'planedJourney', 'totalJourney', 'journeyPlanPercent', 'strikeCalls', 'strike', 'unPlanedJourney', 'unPlanedJourneyPercent'];
  dateFilterControl: FormControl;
  filterForm: FormGroup;
  constructor(
    public dataEditor: DataEditor,
    public fb: FormBuilder,

  ) {
    this.itemSource = new MatTableDataSource<any>();
  }
  requset: any;
  data = [];

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [''],
      salesman_name: [''],
      salesman_code: [''],
    });

    this.subscriptions.push(
      this.dataEditor.newData.subscribe((value) => {
        if (value.type === CompDataServiceType.REPORT_DATA) {
          //console.log(value);
          this.data = value.data;
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
      this.filterForm.get(this.selectedColumnFilter).setValue("");
    }
    this.filterData();
  }
  filterData() {
    let form = this.filterForm.value;
    let filterIn = this.data;
    let data = [];
    data = filterIn.filter((x) => { return ((x.date.includes(form.date)) && (x.merchandiserCode.includes(form.salesman_code)) && (x.merchandiserName.toLowerCase().includes(form.salesman_name.toLowerCase()))) });
    this.updateTableData(data);
    // debugger
    // Object.assign(body, this.requset);
    // this.merService.getReportData(body).subscribe((res) => {
    //   if (res?.status == true) {
    //     this.dataEditor.sendData({
    //       type: CompDataServiceType.REPORT_DATA,
    //       request: this.requset,
    //       data: res.data,
    //     });
    //   }
    // });
  }

  updateTableData(data = []) {
    let newData = data ? data : this.data;
    this.itemSource = new MatTableDataSource<any>(newData);
    this.itemSource.paginator = this.paginator;

  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  onSortData(sort) {
    if (!sort.active || sort.direction === '') {
      // this.updateTableData(this.data)
      return;
    }
    let data = this.itemSource.data.slice().sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'date': return this.compare(a.date, b.date, isAsc);
        case 'merchandiserCode': return this.compare(a.merchandiserCode, b.merchandiserCode, isAsc);
        case 'merchandiserName': return this.compare(a.merchandiserName, b.merchandiserName, isAsc);
        case 'journeyPlan': return this.compare(+a.journeyPlan, +b.journeyPlan, isAsc);
        case 'journeyPlanPercent': return this.compare(+a.journeyPlanPercent, +b.journeyPlanPercent, isAsc);
        case 'planedJourney': return this.compare(+a.planedJourney, +b.planedJourney, isAsc);
        case 'totalJourney': return this.compare(+a.totalJourney, +b.totalJourney, isAsc);
        case 'strikeCalls': return this.compare(+a.strike_calls, +b.strike_calls, isAsc);
        case 'strike': return this.compare(+a.strike_calls_percent, +b.strike_calls_percent, isAsc);
        case 'unPlanedJourney': return this.compare(+a.unPlanedJourney, +b.unPlanedJourney, isAsc);
        case 'unPlanedJourneyPercent': return this.compare(+a.unPlanedJourneyPercent, +b.unPlanedJourneyPercent, isAsc);
        default: return 0;
      }
    });
    this.updateTableData(data);
    //console.log(sort);
  }
  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
