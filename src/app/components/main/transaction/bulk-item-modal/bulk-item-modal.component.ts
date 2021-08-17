import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MasterService } from '../../master/master.service';
import { Subscription, Subject, of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-bulk-item-modal',
    templateUrl: './bulk-item-modal.component.html',
    styleUrls: ['./bulk-item-modal.component.scss'],
})
export class BulkItemModalComponent implements OnInit {
    title: any;
    hasConfirmed: any;
    displayedColumns: string[];
    dataSource: MatTableDataSource<any>;
    clickedRows: Set<PeriodicElement>;
    itempage: any = 1;
    page_size: any = 10;
    isLoading: boolean = false;
    itemfilterValue: string;
    items: any[] = [];
    item_total_pages: any = 0;
    selectedItem: any[] = [];
    quantityArr = {};
    itemRequestModel: pageRequest;
    searchItemValue: any;
    keyUpItem = new Subject<string>();
    uoms: any[] = [];

    constructor(private matDialogRef: MatDialogRef<BulkItemModalComponent>, private masterService: MasterService, private apiService: ApiService) {
    }

    public ngOnInit(): void {
        this.displayedColumns = ['item_code', 'item_name', 'item_uom', 'Quantity'];
        this.itemRequestModel = { page: this.itempage, page_size: this.page_size }
        this.getItemList();
        this.keyUpItem.pipe(
            map((event: any) => event.target.value),
            debounceTime(1000),
            distinctUntilChanged(),
            mergeMap(search => of(search).pipe(
                delay(500),
            )),
        ).subscribe(res => {
            console.log("res", res)
            if (res) {
                this.itemRequestModel.page = 1;
                this.itemRequestModel.item_name = res;
                this.getItemList();
            } else {
                this.itemRequestModel = { page: this.itempage, page_size: this.page_size }

                this.getItemList();
            }
        });
        this.apiService.getAllItemUoms().subscribe((result) => { this.uoms = result.data; });
    }

    getItemList() {
        this.isLoading = true;
        this.masterService.itemDetailListTable(this.itemRequestModel).subscribe(res => {
            this.isLoading = false;
            console.log("res.data", res.data);
            if (this.itemRequestModel.page > 1) {
                this.items = [...this.items, ...res.data];
            } else {
                this.items = res.data;
            }
            this.item_total_pages = res?.pagination?.total_pages;

        });
    }

    changeQuantity(item, value) {
        let index = this.selectedItem.findIndex(x => x.item_code == item.item_code);
        this.selectedItem[index]["quantity"] = value;
    }

    changeUom(item, value) {
        let index = this.selectedItem.findIndex(x => x.item_code == item.item_code);
        this.selectedItem[index]["selected_item_uom"] = value;
    }
    onSelectItem(item, index) {
        if (this.items[index]?.selected) {
            let findIndex = this.selectedItem.findIndex(x => x.id == item.id);
            this.selectedItem.splice(findIndex, 1);
            this.items[index]["selected"] = false;
        } else {
            this.selectedItem.push(item);
            this.items[index]["selected"] = true;
            let itemArray = [];
            const baseUomFilter = this.uoms.filter(
                (x) => x.id == parseInt(item?.lower_unit_uom_id)
            );
            let secondaryUomFilterIds = [];
            let secondaryUomFilter = [];
            if (item?.item_main_price && item?.item_main_price?.length) {
                item?.item_main_price.forEach((item) => {
                    secondaryUomFilterIds.push(item.item_uom_id);
                });
                this.uoms.forEach((item) => {
                    if (secondaryUomFilterIds.includes(item.id)) {
                        secondaryUomFilter.push(item);
                    }
                });
            }

            if (baseUomFilter.length && secondaryUomFilter.length) {
                itemArray = [...baseUomFilter, ...secondaryUomFilter];
            } else if (baseUomFilter.length) {
                itemArray = [...baseUomFilter];
            } else if (secondaryUomFilter.length) {
                itemArray = [...secondaryUomFilter];
            }
            this.items[index]["item_uom_list"] = itemArray;
            if (itemArray.length > 0)
                this.selectedItem[this.selectedItem.length - 1]["selected_item_uom"] = itemArray[0].id;

        }
        this.dataSource = new MatTableDataSource(this.selectedItem);
    }

    loadMoreItem() {
        this.itemRequestModel.page++;
        this.getItemList();
    }

    saveItems() {
        this.matDialogRef.close(this.selectedItem);
    }
}
export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}

export interface pageRequest {
    page: number;
    page_size: number;
    item_name?: string;
}