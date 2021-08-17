
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { MasterService } from 'src/app/components/main/master/master.service';
import { Subscription, Subject } from 'rxjs';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
import { PAGE_SIZE_10 } from './../../../../../app.constant';
@Component({
  selector: 'app-rebate-form',
  templateUrl: './rebate-form.component.html',
  styleUrls: ['./rebate-form.component.scss']
})
export class RebateFormComponent implements OnInit {
  public pageTitle: string;
  public isEditForm: boolean;
  public editData;
  public rebateFormGroup;
  rows: FormArray = this.fb.array([]);
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  private router: Router;
  private route: ActivatedRoute;
  private apiService: ApiService;
  rebateType: FormControl;
  private subscriptions: Subscription[] = [];
  public customers = [];
  public customerLobList = [];
  customerFormControl: FormControl;
  customerLobFormControl: FormControl;
  selectedRoutes: FormControl;
  filterValue = '';
  public page = 1;
  public page_size = PAGE_SIZE_10;
  public total_pages = 0;
  public isLoading: boolean;
  public lookup$: Subject<any> = new Subject();
  options = [
    {
      type: 'radio',
      name: 'Cash Rebate',
      value: '1',
      isSelected: true
    },
    {
      type: 'radio',
      name: 'Additional Discount Rebate',
      value: '2',
      isSelected: false
    },
    {
      type: 'radio',
      name: 'Target Rebate',
      value: '3',
      isSelected: false
    }
  ];
  displayColumns = ['min_slab', 'max_slab', 'value', 'action'];
  data: SlabData[] = [{ from_value: '', to_value: '', value: '', percentage: '' }];
  isSubmitted: boolean;
  routes: any[] = [];
  constructor(
    private cts: CommonToasterService,
    router: Router,
    route: ActivatedRoute,
    apiService: ApiService,
    public fb: FormBuilder,
    public masterService: MasterService
  ) {
    Object.assign(this, { router, route, apiService });
  }



  ngOnInit(): void {
    this.customerFormControl = new FormControl('');
    this.rebateType = new FormControl('1');
    this.customerLobFormControl = new FormControl('');
    this.selectedRoutes = new FormControl([]);
    this.rebateFormGroup = this.fb.group({
      agreement_id: ['', [Validators.required]],
      customer_code: [''],
      user_id: [''],
      type: [''],
      name: ['', [Validators.required]],
      lob_id: ['', [Validators.required]],
      rebate: ['0', [Validators.required]],
      amount: ['', [Validators.required]],
      discount_amount: ['', [Validators.required]],
      is_promtional_sales: [false, [Validators.required]],
      from_date: ['', [Validators.required]],
      to_date: ['', [Validators.required]],
      slab: this.rows
    })

    this.checkEditDataAndPatch();

    // this.subscriptions.push(
    //   this.apiService.getCustomers().subscribe((result) => {
    //     this.customers = result.data.map(item => {
    //       console.log(item.user)
    //       if (item.user !== null) {
    //         item['user']['lastname'] = [item.user?.lastname, item.customer_code].join(" - ")
    //         return item;
    //       }
    //       return item;
    //     });
    //   })
    // );
    this.subscriptions.push(
      this.masterService.customerDetailListTable({ page: this.page, page_size: 10 }).subscribe((result) => {
        this.page++;
        this.customers = result.data;
        this.customers = result.data;
        this.total_pages = result.pagination?.total_pages
      })
    );
    this.subscriptions.push(
      this.apiService.getMasterDataListsByItem("route").subscribe((result: any) => {
        this.routes = result.data.route;
        if (this.editData) {
          result.data.route.forEach(element => {
            if (this.editData?.route_id == element.id) {
              this.selectedRoutes.setValue([{ itemName: element.route_name, id: element.id }])
            }
          });
        }
      })
    );
    this.subscriptions.push(
      this.customerFormControl.valueChanges
        .pipe(
          debounceTime(500),
          startWith<string | any>(''),
          map((value) => (typeof value === 'string' ? value : value?.user?.firstname)),
          map((value: string) => {
            return value;
          })
        ).subscribe((res) => {
          this.filterValue = res || "";
          this.page = 1;
          this.lookup$.next(this.page)
        })
    );

    this.lookup$
      .pipe(exhaustMap(() => {
        return this.masterService.customerDetailListTable({ name: this.filterValue.toLowerCase(), page: this.page, page_size: this.page_size })
      }))
      .subscribe(res => {
        this.isLoading = false;
        if (this.filterValue == "") {
          if (this.page > 1) {
            this.customers = [...this.customers, ...res.data];
          } else {
            this.customers = res.data;
          }
          this.page++;
          this.total_pages = res?.pagination?.total_pages;
        } else {
          this.page = 1;
          this.customers = res.data;
        }
      })

    this.data.forEach((d: SlabData) => this.addRow());
    this.updateView();
  }
  updateView() {
    this.dataSource.next(this.rows.controls);
  }
  deleteItem(index) {
    this.rows.removeAt(index);
    this.updateView();
  }
  addRow() {
    if (this.rows.length > 0) {
      const row = this.fb.group({
        from_value: [''],
        to_value: [''],
        value: [''],
        percentage: [''],
      });
      this.rows.push(row);
    } else {
      const row = this.fb.group({
        from_value: [''],
        to_value: [''], //min value of mislab, bind with current input value
        value: [''],
        percentage: [''],
      });
      this.rows.push(row);
    }
    this.updateView();
  }
  showSlab(event) {
    if (event == 1) {
      this.displayColumns = ['min_slab', 'max_slab', 'percentage', 'action'];
    } else {
      this.displayColumns = ['min_slab', 'max_slab', 'value', 'action'];
    }
  }
  deleteRowInvalid(): boolean {
    if (this.rows.length <= 1) {
      return true;
    }
    else {
      return false;
    }
  }
  checkEditDataAndPatch() {
    if (this.router.url.includes('rebate/edit')) {
      let uuid: string;
      this.isEditForm = true;
      this.pageTitle = 'Edit Rebate';
      this.route.paramMap.subscribe((params) => {
        uuid = params.get('uuid');
        this.apiService.getRebate(uuid).subscribe((res) => {
          this.editData = res.data;
          const data = res.data;
          if (data) {
            let editData = data;
            editData.customerObj = { id: editData.user?.customer_info?.id, user: editData.user, user_id: editData.user?.customer_info?.user_id, customer_code: editData.user?.customer_info?.customer_code };
            editData.user = editData.user?.customer_info?.id
              ? {
                customer_id: editData.user?.customer_info?.id,
                user_id: editData.user?.customer_info?.user_id,
                customer_name: editData.user
                  ? editData.user.firstname + ' ' + editData.user.lastname
                  : 'Unknown',
              }
              : undefined;
            this.customerFormControl.setValue(editData.customerObj);
            this.selectionchangedCustomer(editData);
            this.rebateType.setValue(data?.type);
            if (this.rebateType.value == 1) {
              data.discount_amount = data?.amount;
            }
            this.rebateFormGroup.patchValue({
              agreement_id: data?.agreement_id || "",
              name: data?.name || "",
              rebate: data?.rebate || "0",
              amount: data?.amount || "",
              discount_amount: data?.discount_amount || "",
              is_promtional_sales: data?.is_promtional_sales == '1' ? true : false,
              from_date: data?.from_date || "",
              to_date: data?.to_date || "",
              customer_code: data.customer_code,
              user_id: data.user_id,
            });

          }
        });
      });
    } else {
      this.pageTitle = 'Add Rebate';
    }
  }

  public customerControlDisplayValue(customer: any): string {
    return `${customer?.user?.firstname ? customer?.user?.firstname : ''} ${customer?.user?.lastname ? customer?.user?.lastname : ''}`
  }

  onScroll() {
    if (this.total_pages < this.page) return;
    this.isLoading = true;
    this.lookup$.next(this.page);
  }

  selectionchangedCustomer(editData?) {
    console.log(this.customerFormControl.value);
    let customer = this.customerFormControl.value;
    this.rebateFormGroup.patchValue({
      customer_code: customer?.customer_code || "",
      user_id: customer?.user_id || ""
    })
    this.getCustomerLobList(customer, editData);
  }

  getCustomerLobList(customer, editData?) {
    var user_id = customer?.user?.id;
    if (!user_id) {
      user_id = editData?.user_id;
    }

    this.apiService.getLobsByCustomerId(user_id).subscribe((result) => {
      this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
      if (editData) {
        let customerLob = [{ id: editData?.lob_id, itemName: editData?.lob?.name }];
        this.customerLobFormControl.setValue(customerLob);
        this.rebateFormGroup.patchValue({
          lob_id: editData?.lob_id
        });
      }
    })
  }

  selectionchangedCustomerLob() {
    this.rebateFormGroup.patchValue({
      lob_id: this.customerLobFormControl.value[0].id
    });
  }

  setRebateType() {
    this.rebateFormGroup.get('rebate').setValue('0');
    this.rebateFormGroup.get('discount_amount').setValue('');
  }
  saveRebate() {
    console.log(this.rebateFormGroup);
    this.isSubmitted = true;
    let body = {
      "agreement_id": this.rebateFormGroup.value.agreement_id,
      "customer_code": this.rebateFormGroup.value.customer_code,
      "user_id": this.rebateFormGroup.value.user_id,
      "name": this.rebateFormGroup.value.name,
      "lob_id": this.rebateFormGroup.value.lob_id,
      "rebate": this.rebateFormGroup.value.rebate,
      "type": this.rebateType.value,
      "discount_amount": this.rebateFormGroup.value.discount_amount,
      "from_date": this.rebateFormGroup.value.from_date,
      "to_date": this.rebateFormGroup.value.to_date,
      'amount': this.rebateFormGroup.value.amount
    }

    if (this.rebateType.value == 1) {
      body.amount = this.rebateFormGroup.value.discount_amount
      body.discount_amount = 0;
    }
    if (this.rebateType.value == '2') {
      body['is_promtional_sales'] = this.rebateFormGroup.value.is_promtional_sales
    }
    if (this.rebateType.value == '3') {
      let slab = [];
      this.rebateFormGroup.get('slab').value.forEach(element => {
        if (this.rebateFormGroup.get('rebate').value == 0) {
          slab.push({ 'from_value': element.from_value, 'to_value': element.to_value, 'value': element.value })
        } else {
          slab.push({ 'from_value': element.from_value, 'to_value': element.to_value, 'value': element.percentage })
        }
      });
      body['is_promtional_sales'] = this.rebateFormGroup.value.is_promtional_sales
      body['slab'] = slab;

    }
    body['route_id'] = this.selectedRoutes.value.length > 0 && this.selectedRoutes.value[0].id || "";

    console.log('Body', body);
    if (this.isEditForm) {
      this.updateRebate(body);
    } else {
      this.postRebate(body);
    }
  }

  postRebate(finalData) {
    this.apiService.addRebate(finalData).subscribe((res) => {
      //console.log(res);
      this.router.navigate(['pricing-plan/rebate']).then(() => {
        // window.location.reload();
      });
    });
  }

  updateRebate(finalData) {
    this.apiService
      .editRebate(this.editData.uuid, finalData)
      .subscribe((res) => {
        this.router.navigate(['pricing-plan/rebate']).then(() => {
          // window.location.reload();
        });
      });
  }


}
export interface SlabData {
  from_value: string;
  to_value: string;
  value: string;
  percentage: string;
}