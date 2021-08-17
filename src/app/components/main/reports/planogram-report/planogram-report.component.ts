import { Component, OnInit, ViewChild } from '@angular/core';

import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-planogram-report',
  templateUrl: './planogram-report.component.html',
  styleUrls: ['./planogram-report.component.scss']
})
export class PlanogramReportComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  itemSource = new MatTableDataSource();
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['created_at', 'name', 'start_date', 'end_date'];
  dateFilterControl: FormControl;
  selectedColumnFilter: string;

  constructor() {
    this.itemSource = new MatTableDataSource<any>();
  }

  data = [
    { created_at: '2020-09-25T14:47:07.000000Z', name: 'Dummy 1', start_date: '2020-09-25', end_date: '2020-09-25' },
    { created_at: '2020-09-25T14:47:07.000000Z', name: 'Dummy 2', start_date: '2020-09-25', end_date: '2020-09-25' },
    { created_at: '2020-09-25T14:47:07.000000Z', name: 'Dummy 3', start_date: '2020-09-25', end_date: '2020-09-25' },
    { created_at: '2020-09-25T14:47:07.000000Z', name: 'Dummy 4', start_date: '2020-09-25', end_date: '2020-09-25' },
    { created_at: '2020-09-25T14:47:07.000000Z', name: 'Dummy 5', start_date: '2020-09-25', end_date: '2020-09-25' },
  ]

  ngOnInit(): void {
    this.itemSource = new MatTableDataSource<any>(this.data);
    this.itemSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }
  onColumnFilterOpen(item) {
    this.selectedColumnFilter = item
  }
  onColumnFilter(item) {

  }
}
