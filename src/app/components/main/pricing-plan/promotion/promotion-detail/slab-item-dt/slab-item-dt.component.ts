import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/services/api.service';

const OFFER_ITEMS: any[] = [
  { itemName: 'item1', uom: 'PCS', slabedQty: '1' },
  { itemName: 'item2', uom: 'BOX', slabedQty: '7' },
];
@Component({
  selector: 'app-slab-item-dt',
  templateUrl: './slab-item-dt.component.html',
  styleUrls: ['./slab-item-dt.component.scss'],
})
export class SlabItemDtComponent implements OnInit, OnChanges {
  @Input() slabItems: any[];
  displayColumns: string[] = ['from_qty', 'to_qty', 'item_uom', 'offer_qty'];
  dataSource = new MatTableDataSource();
  constructor(private apiService: ApiService) { }
  @ViewChild('selectedInvoiceMatPaginator', { static: true }) selectedInvoicePaginator: MatPaginator;

  ngOnInit(): void {
  }
  ngOnChanges(): void {
    let structuredSlabItems = [];
    this.apiService.getAllItemUoms().subscribe((uoms) => {

      this.slabItems.forEach((item) => {
        let data: any = new SlabItem();
        data.from_qty = item.from_qty;
        data.item_uom_name = uoms.data.find(x => x.id == item.item_uom_id).name;
        data.offer_qty = item.offer_qty;
        data.to_qty = item.to_qty;
        structuredSlabItems.push(data);
      });
      this.dataSource = new MatTableDataSource(structuredSlabItems);
      this.dataSource.paginator = this.selectedInvoicePaginator;
    });

  }
}
class SlabItem {
  from_qty: any;
  to_qty: any;
  item_uom: any;
  offer_qty: any;
}
