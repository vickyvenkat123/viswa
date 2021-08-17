import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
@Component({
  selector: 'app-add-portfolio-management',
  templateUrl: './add-portfolio-management.component.html',
  styleUrls: ['./add-portfolio-management.component.scss'],
})
export class AddPortfolioManagementComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public portfolioFormGroup: FormGroup;
  public itemFormGroup: FormGroup;
  public CodeFormControl: FormControl;
  public NameFormControl: FormControl;
  public startFormControl: FormControl;
  public endFormControl: FormControl;
  public CustomerFormControl: FormControl;
  public ItemFormControl: FormControl;
  nextCommingNumberofrouteitemgroupCode: string = '';
  public ItemCodeFormControl: FormControl;
  public ItemListingFeesFormControl: FormControl;
  public ItemStorePriceFormControl: FormControl;
  public routeItemdata: any;
  public customerID: any;
  public itemData: any[] = [];
  public filteredItems: any[] = [];
  public formType: string;
  private isEdit: boolean;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  public displayedColumns = ['itemCode', 'itemName', 'store_price', 'actions'];
  public itemSource: any;
  private itemCodeList: {
    item_id: number;
    item_name: string;
  }[] = [];
  private updateItemCode: {
    index: number;
    isEdit: boolean;
  };
  nextCommingNumberofrouteitemgroupCodePrefix: any;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog
  ) {
    Object.assign(this, { fds, apiService, dataEditor });
    this.itemSource = new MatTableDataSource<any>();
  }

  public ngOnInit(): void {
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      if (this.formType != 'Edit') {
        this.getrouteitemgroupCode();
      }
    });
    // this.CodeFormControl = new FormControl('', [ Validators.required, Validators.pattern('^[0-9]*$') ]);
    this.CodeFormControl = new FormControl('', [Validators.required]);
    this.NameFormControl = new FormControl('', [Validators.required]);
    this.startFormControl = new FormControl('', [Validators.required]);
    this.endFormControl = new FormControl('', [Validators.required]);
    this.CustomerFormControl = new FormControl('', [Validators.required]);
    this.ItemCodeFormControl = new FormControl('', [Validators.required]);
    this.ItemListingFeesFormControl = new FormControl('');
    this.ItemStorePriceFormControl = new FormControl('');
    this.ItemFormControl = new FormControl([]);

    this.portfolioFormGroup = new FormGroup({
      code: this.CodeFormControl,
      name: this.NameFormControl,
      start_date: this.startFormControl,
      end_date: this.endFormControl,
      customer: this.CustomerFormControl,
      items: this.ItemFormControl,
    });
    this.CodeFormControl.disable();
    this.itemFormGroup = new FormGroup({
      item_id: this.ItemCodeFormControl,
      listing_fees: this.ItemListingFeesFormControl,
      store_price: this.ItemStorePriceFormControl
    });
    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.customerID = result.data.customers.map(item => {
          return {
            ...item,
            lastname: item.lastname + ' - ' + item.customer_info.customer_code
          }
        })

        this.itemData = result.data.items;
        this.filteredItems = result.data.items;
      })
    );
    this.subscriptions.push(
      this.ItemCodeFormControl.valueChanges
        .pipe(
          distinctUntilChanged(
            (a, b) => JSON.stringify(a) === JSON.stringify(b)
          )
        )
        .pipe(
          startWith<string | any>(''),
          map((value) => (typeof value === 'string' ? value : value?.item_name)),
          map((value: string) => {
            return value ? this.filterItems(value) : this.itemData;
          })
        ).subscribe((res) => {
          console.log(res);
          this.filteredItems = res;
          // this.itemfilterValue = res || "";
          // this.itempage = 1;
          // this.items = [];
          // this.filteredItems = [];
          // this.isLoading = true;
          // this.itemlookup$.next(this.itempage)
        })
    );
    // this.subscriptions.push(
    //   this.apiService.getCustomers().subscribe((result: any) => {
    //     this.customerID = result.data;
    //   })
    // );
    // this.subscriptions.push(
    //   this.apiService.getAllItems().subscribe((result: any) => {
    //     this.itemData = result.data;
    //   })
    // );
    this.subscriptions.push(
      this.dataEditor.newData.subscribe((result) => {
        const data: any = result.data;
        let customers = [];
        data?.portfolio_management_customer?.forEach(element => {
          customers.push({ id: element.user_id, itemName: `${element.user?.firstname} ${element.user?.lastname}` });
        });
        //console.log('data : ', data);
        if (data && data.uuid) {
          this.CodeFormControl.setValue(data.code);
          this.CodeFormControl.disable();
          this.NameFormControl.setValue(data.name);
          this.startFormControl.setValue(data.start_date);
          this.endFormControl.setValue(data.end_date);
          this.CustomerFormControl.setValue(customers);
          this.routeItemdata = data;
          this.isEdit = true;
          let tblData = [];
          data.portfolio_management_item.forEach((element) => {
            tblData.push({
              item_id: element.item_id,
              item_code: element.item.item_code,
              store_price: element.store_price,
              listing_fees: element.listing_fees,
              item_name: element.item.item_name,
            });
          });
          this.ItemFormControl.setValue(tblData);
          this.updateItemSource();
          // const customersValue = data.portfolio_management_customer.map(
          //   (item) => item.user_id
          // );
          // this.CustomerFormControl.setValue(customersValue);
        }
        return;
      })
    );
  }

  private filterItems(itemName: string): any[] {
    const filterValue = itemName.toLowerCase();
    return this.itemData.filter((item) =>
      item.item_name.toLowerCase().includes(filterValue) ||
      item.item_code.toLowerCase().includes(filterValue)
    );
  }

  public itemsControlDisplayValue(item) {
    console.log(item)
    return item ? item.item_code + " " + item.item_name : undefined;
  }

  getrouteitemgroupCode() {
    let nextNumber = {
      function_for: 'portfolio',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofrouteitemgroupCode = res.data.number_is;
        this.nextCommingNumberofrouteitemgroupCodePrefix = res.data.prefix_is;
        if (this.nextCommingNumberofrouteitemgroupCode) {
          this.CodeFormControl.setValue(
            this.nextCommingNumberofrouteitemgroupCode
          );
          this.CodeFormControl.disable();
        } else if (this.nextCommingNumberofrouteitemgroupCode == null) {
          this.nextCommingNumberofrouteitemgroupCode = '';
          this.CodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofrouteitemgroupCode = '';
        this.CodeFormControl.enable();
      }
      //console.log('Res : ', res);
    });
  }
  public close() {
    this.fds.close();
    this.portfolioFormGroup.reset();
    this.itemFormGroup.reset();
    this.resetItemSource();
    this.isEdit = false;
  }

  public editItemCode(num: number, itemCodeData: any): void {
    // this.ItemCodeFormControl.setValue(itemCodeData.item_id);
    console.log(itemCodeData);
    this.ItemCodeFormControl.setValue(itemCodeData);
    this.ItemListingFeesFormControl.setValue(itemCodeData.listing_fees);
    this.ItemStorePriceFormControl.setValue(itemCodeData.store_price);
    this.updateItemCode = {
      index: num,
      isEdit: true,
    };
  }

  public deleteItemCode(index: number): void {
    this.ItemFormControl.value.splice(index, 1);
    this.updateItemSource();
  }

  public addItemCode(): void {
    if (this.updateItemCode && this.updateItemCode.isEdit) {
      this.updateExistingItemCode(
        this.updateItemCode && this.updateItemCode.index
      );
    }
    if (this.itemFormGroup.invalid) {
      return;
    }
    let itemName = '';
    let itemcode = '';
    this.itemData.forEach((item, i) => {
      if (item.id == this.ItemCodeFormControl.value?.id) {
        itemName = item.item_name;
        itemcode = item.item_code;
      }
    });
    const itemCode = {
      item_id: this.ItemCodeFormControl.value?.id,
      item_name: itemName,
      item_code: itemcode,
      listing_fees: this.ItemListingFeesFormControl.value,
      store_price: this.ItemStorePriceFormControl.value,
    };
    this.itemCodeList.push(itemCode);
    const itemValue = this.ItemFormControl.value
      ? this.ItemFormControl.value
      : [];
    this.ItemFormControl.setValue([...itemValue, itemCode]);
    this.updateItemSource();
  }

  public updateExistingItemCode(index: number): void {
    console.log(this.ItemCodeFormControl.value);
    let itemName = '';
    let itemcode = '';
    this.itemData.forEach((item, i) => {
      if (item.id == this.ItemCodeFormControl.value?.id || item.id == this.ItemCodeFormControl.value?.item_id) {
        itemName = item.item_name;
        itemcode = item.item_code;
      }
    });
    this.ItemFormControl.value.splice(index, 1, {
      item_id: this.ItemCodeFormControl.value?.id || this.ItemCodeFormControl.value?.item_id,
      item_name: itemName,
      item_code: itemcode,
      listing_fees: this.ItemListingFeesFormControl.value,
      store_price: this.ItemStorePriceFormControl.value,
    });
    this.updateItemCode = undefined;
    this.updateItemSource();
  }

  private updateItemSource(): void {
    this.itemSource = new MatTableDataSource<any>(this.ItemFormControl.value);
    this.itemSource.paginator = this.paginator;
    this.itemFormGroup.reset();
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }

  private resetItemSource(): void {
    this.itemSource = new MatTableDataSource();
  }

  public savePortfolioItemGroupData() {
    if (this.portfolioFormGroup.invalid) {
      return;
    }
    if (this.isEdit) {
      this.editPortfolioItemGroupData();
      return;
    } else {
      this.addPortfolioItemGroupData();
    }
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private addPortfolioItemGroupData(): void {
    let itemsIds = [];
    this.ItemFormControl.value.map((id) => {
      //console.log(id);
      itemsIds.push({
        item_id: id.item_id,
        listing_fees: id.listing_fees,
        store_price: id.store_price,
      });
    });

    let customerIds = [];
    this.CustomerFormControl.value.map((id) => {
      customerIds.push({
        customer_id: id.id,
      });
    });

    this.apiService
      .addPortfolioData({
        customers: customerIds,
        name: this.NameFormControl.value,
        code: this.CodeFormControl.value,
        start_date: this.startFormControl.value,
        end_date: this.endFormControl.value,
        items: itemsIds,
      })
      .subscribe((result: any) => {
        let data = result.data;
        data.edit = false;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }

  private editPortfolioItemGroupData(): void {
    let itemsIds = [];
    this.ItemFormControl.value.map((id) => {
      itemsIds.push({
        item_id: id.item_id,
        listing_fees: id.listing_fees,
        store_price: id.store_price,
      });
    });
    let customerIds = [];
    this.CustomerFormControl.value.map((id) => {
      customerIds.push({
        customer_id: id.id,
      });
    });
    this.apiService
      .editPortfolio(this.routeItemdata.uuid, {
        customers: customerIds,
        name: this.NameFormControl.value,
        code: this.CodeFormControl.value,
        start_date: this.startFormControl.value,
        end_date: this.endFormControl.value,
        items: itemsIds,
      })
      .subscribe((result: any) => {
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }
  open() {
    let response: any;
    let data = {
      title: 'Portfolio Management',
      functionFor: 'portfolio',
      code: this.nextCommingNumberofrouteitemgroupCode,
      prefix: this.nextCommingNumberofrouteitemgroupCodePrefix,
      key: this.nextCommingNumberofrouteitemgroupCode.length
        ? 'autogenerate'
        : 'manual',
    };
    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: 'auto',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.CodeFormControl.setValue('');
          this.nextCommingNumberofrouteitemgroupCode = '';
          this.CodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.CodeFormControl.setValue(res.data.next_coming_number_portfolio);
          this.nextCommingNumberofrouteitemgroupCode =
            res.data.next_coming_number_portfolio;
          this.nextCommingNumberofrouteitemgroupCodePrefix = res.reqData.prefix_code;
          this.CodeFormControl.disable();
        }
      });
  }
}
