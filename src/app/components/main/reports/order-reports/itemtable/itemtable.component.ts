import { Component, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { Utils } from 'src/app/services/utils';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CompDataServiceType } from 'src/app/services/constants';
@Component({
  selector: 'app-order-itemtable',
  templateUrl: './itemtable.component.html',
  styleUrls: ['./itemtable.component.scss']
})
export class OrderItemtableComponent implements OnInit {
  @Input() data: any = {};
  private subscriptions: Subscription[] = [];
  public displayedColumns = [
    'item_code',
    'item',
    'item_qty',
    'item_uom',

  ];
  public displayLabels = [
    'Item Code',
    'Item',
    'Qty',
    'Uom',

  ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public itemSource = new MatTableDataSource();
  dateFilterControl: FormControl;
  constructor(public dataEditor: DataEditor) { }

  ngOnInit(): void {
    this.itemSource = new MatTableDataSource(this.data);
    this.itemSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.itemSource = new MatTableDataSource(this.data);
    this.itemSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

}
