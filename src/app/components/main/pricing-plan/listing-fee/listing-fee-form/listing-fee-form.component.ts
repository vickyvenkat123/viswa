
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { MasterService } from 'src/app/components/main/master/master.service';
import { Subscription, Subject } from 'rxjs';
import { map, startWith, distinctUntilChanged, filter, switchMap, exhaustMap, tap, debounceTime, scan, } from 'rxjs/operators';
import { PAGE_SIZE_10 } from './../../../../../app.constant';
@Component({
  selector: 'app-listing-fee-form',
  templateUrl: './listing-fee-form.component.html',
  styleUrls: ['./listing-fee-form.component.scss']
})
export class ListingFeeFormComponent implements OnInit {

  public pageTitle: string;
  public isEditForm: boolean;
  public editData;
  public listingFeeFormGroup;
  private router: Router;
  private route: ActivatedRoute;
  private apiService: ApiService;
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
  routes: any = [];;
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
    this.customerLobFormControl = new FormControl('');
    this.selectedRoutes = new FormControl([]);
    this.listingFeeFormGroup = this.fb.group({
      agreement_id: ['', [Validators.required]],
      customer_code: [''],
      user_id: [''],
      name: ['', [Validators.required]],
      lob_id: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      from_date: ['', [Validators.required]],
      to_date: ['', [Validators.required]],
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
  }

  checkEditDataAndPatch() {
    if (this.router.url.includes('listing-fee/edit')) {
      let uuid: string;
      this.isEditForm = true;
      this.pageTitle = 'Edit Listing Fee';
      this.route.paramMap.subscribe((params) => {
        uuid = params.get('uuid');
        this.apiService.getListingFee(uuid).subscribe((res) => {
          this.editData = res.data;
          const data = res.data;
          console.log(data)
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
            this.listingFeeFormGroup.patchValue({
              agreement_id: data?.agreement_id || "",
              name: data?.name || "",
              amount: data?.amount || "",
              from_date: data?.from_date || "",
              to_date: data?.to_date || "",
            });


          }
        });
      });
    } else {
      this.pageTitle = 'Add Listing Fee';
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
    this.listingFeeFormGroup.patchValue({
      customer_code: customer?.customer_code || "",
      user_id: customer?.user_id || ""
    })
    this.getCustomerLobList(customer, editData);
  }

  getCustomerLobList(customer, editData?) {
    this.apiService.getLobsByCustomerId(customer?.user_id).subscribe((result) => {
      this.customerLobList = result.data[0] && result.data[0]?.customerlob || [];
      if (editData) {
        let customerLob = [{ id: editData?.lob_id, itemName: editData?.lob?.name }];
        this.customerLobFormControl.setValue(customerLob);
        this.listingFeeFormGroup.patchValue({
          lob_id: editData?.lob_id
        });
      }
    })
  }

  selectionchangedCustomerLob() {
    this.listingFeeFormGroup.patchValue({
      lob_id: this.customerLobFormControl.value[0].id
    });
  }

  saveListingFee() {
    console.log(this.selectedRoutes);
    let finalData = this.listingFeeFormGroup.value;

    finalData['route_id'] = this.selectedRoutes.value.length > 0 && this.selectedRoutes.value[0].id || "";
    if (this.isEditForm) {
      this.updateListingFee(finalData);
    } else {
      this.postListingFee(finalData);
    }
  }

  postListingFee(finalData) {
    this.apiService.addListingFee(finalData).subscribe((res) => {
      //console.log(res);
      this.router.navigate(['pricing-plan/listing-fee']).then(() => {
        // window.location.reload();
      });
    });
  }

  updateListingFee(finalData) {
    this.apiService
      .editRebate(this.editData.uuid, finalData)
      .subscribe((res) => {
        this.router.navigate(['pricing-plan/listing-fee']).then(() => {
          // window.location.reload();
        });
      });
  }


}
