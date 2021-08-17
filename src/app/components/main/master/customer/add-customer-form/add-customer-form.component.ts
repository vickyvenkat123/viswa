import { customerInfo } from './../../../transaction/delivery/delivery-model';
import { MasterService } from 'src/app/components/main/master/master.service';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  NgZone,
  Input,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import {
  PaymentTerms,
  PayementtermsDialogComponent,
} from 'src/app/components/dialogs/payementterms-dialog/payementterms-dialog.component';
import { ChannelComponent } from 'src/app/components/dialog-forms/add-channel/channel.component';
import { SalesOrganisationFormComponent } from 'src/app/components/dialog-forms/sales-organisation-form/sales-organisation-form.component';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { APP } from 'src/app/app.constant';
import { BaseComponent } from '../../../../../features/shared/base/base.component';
import { CustomerCategoryFormComponent } from '../customer-category-form/customer-category-form.component';
import { MapsAPILoader } from '@agm/core';
import { ReturnStatement } from '@angular/compiler';
import { AddCustomerGroupComponent } from '../add-customer-group-form/add-customer-group-form.component';
import { SalesmanLobComponent } from '../../salesman/salesman-lob/salesman-lob.component';

interface Customertype {
  id: number;
  value: string;
}
@Component({
  selector: 'app-add-customer-form',
  templateUrl: './add-customer-form.component.html',
  styleUrls: ['./add-customer-form.component.scss'],
})
export class AddCustomerFormComponent extends BaseComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('officeSrch') public officeSrch: ElementRef;
  @ViewChild('homeSrch') public homeSrch: ElementRef;
  // domain = window.location.host.split('.')[0];
  domain = 'vansales';
  customer: Customertype[] = [];
  customerLobList = [];
  public customerFormGroup: FormGroup;
  // public imageFormControl: FormControl;
  // public firstnameFormControl: FormControl;
  // public lastnameFormControl: FormControl;
  // public emailFormControl: FormControl;
  // public phoneNumberFormControl: FormControl;
  // public passwordFormControl: FormControl;
  // public customerCodeFormControl: FormControl;
  // public customertypeFormControl: FormControl;
  public officeAddressFormControl: FormControl;
  public homeAddressFormControl: FormControl;
  // public customerCityFormControl: FormControl;
  // public customerStateFormControl: FormControl;
  // public customerZipCodeFormControl: FormControl;
  // public customerPhoneFormControl: FormControl;
  // public balanceFormControl: FormControl;
  // public erpCodeFormControl: FormControl;
  public merchandiserFormControl: FormControl;
  // public creditLimitFormControl: FormControl;
  // public creditdaysFormControl: FormControl;
  // public userTypeFormControl: FormControl;
  // public parentIdFormControl: FormControl;
  // public countryIdFormControl: FormControl;
  // public roleIdFormControl: FormControl;
  // public regionIdFormControl: FormControl;
  // public salesOrganizationIdFormControl: FormControl;
  // public customerGroupIdFormControl: FormControl;
  // public shipToPartyFormControl: FormControl;
  // public soldToPartyFormControl: FormControl;
  // public payerFormControl: FormControl;
  // public billToPartyFormControl: FormControl;
  // public salesManRouteIdFormControl: FormControl;
  // public channelFormControl: FormControl;
  // public subchannelFormControl: FormControl;
  // public customerCategoryFormControl: FormControl;
  // public customerLobType: FormControl;
  // public lobCustomerInfo: FormArray;
  private customerData: any;
  public countryList: any;
  public regionList: any;
  public salesOrganisationsList: any[] = [];
  public customerCategoryList: any;
  public depots: any;
  public formType: string;
  public customerID: any[] = [];
  public filterCustomerId: any[] = [];
  public filterCustomerId1: any[] = [];
  public shipToParty: string = '';
  public soldToParty: string = '';
  public payers: string = '';
  public bill: string = '';
  public channelData;
  private formPopulateData: any;
  public isEdit: boolean = false;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  public lobSelectedIndex = 0;
  public selectedIndex: FormControl = new FormControl(0);
  public isSelectedIndex: boolean = true;
  areas: any;
  public channels: any[] = [];
  subchannel: any;
  paymentOptions: PaymentTerms[] = [];
  filteredOptions: Observable<string[]>;
  nextCommingNumberofCustomerCode: string = '';
  public channelSubject: BehaviorSubject<any> = new BehaviorSubject<any>('');
  isCustomField = false;
  moduleId = APP.MODULE.CUSTOMER;
  customFields: Array<any> = [];
  editData = [];
  merchandiserList = [];
  customerGroupList = [];
  nextCommingNumberofCustomerCodePrefix: any;
  office_lat = 0.0;
  office_lang = 0.0;
  home_lat = 0.0;
  home_lang = 0.0;
  public selectedFiles = [];
  public selectedDoc = [];
  public expiryDate = '';
  public fileNames = [];
  public filechoosed = false;
  customerCreditLimit;
  selectedPaymentTerm: PaymentTerms;
  orderBlockCheck: FormControl;
  salesBlockCheck: FormControl;
  returnBlockCheck: FormControl = new FormControl(true);
  creditLimitBlockCheck: FormControl;
  formSubmit: boolean;

  constructor(
    fds: FormDrawerService,
    private route: ActivatedRoute,
    apiService: ApiService,
    dataEditor: DataEditor,
    private commonToasterService: CommonToasterService,
    public dialog: MatDialog,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public masterService: MasterService,
    public fb: FormBuilder
  ) {
    super('Customer');
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    // this.initOfficeSearch();
    // this.initHomeSearch();
    this.buildForm();
    this.getCustomFieldStatus();
    this.formPopulateData = this.route.snapshot.data[
      'customer_resolve'
    ].customerAdd.data;
    this.customerLobList = this.route.snapshot.data[
      'customer_resolve'
    ].lobList.data;
    this.customerCreditLimit = this.route.snapshot.data[
      'customer_resolve'
    ].creditLimit.data;
    this.customerGroupList = this.route.snapshot.data[
      'customer_resolve'
    ].customerGroup.data;
    this.customerCategoryList = this.formPopulateData.customer_category;
    this.customer = this.formPopulateData.customer_type;
    const customercode = this.formPopulateData.code;
    this.loadFormData();
    console.log('countryList', this.countryList)
    console.log('formPopulateData', this.formPopulateData)
    this.fds.formType.subscribe((s) => {
      this.getCustomerDataList();
      this.formType = s;
      if (this.formType == 'Add') {
        this.customerFormGroup.reset();
        this.buildForm();
        this.getNextComingCode();
        let formArray2 = this.getLobCustomerInfo;
        // formArray2.controls[0]['controls'].countryId.valueChanges.subscribe(selectedValue => {
        //   this.getRegionList(selectedValue);
        // })
        // this.setCustomerCode(customercode);
        this.isEdit = false;
      } else if (this.formType == 'Edit') {
        console.log('this.formType ', this.formType)
        this.customerFormGroup.reset();
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;
          console.log('data', data)
          if (data && data.uuid) {
            this.editData = result.data.custom_field_value_save;
            this.buildForm(data);
            // this.getRegionList(data?.user_country?.country_id);
            this.customerData = data;
            this.isEdit = true;
          }
        })

      }
      this.customerFormGroup.get('customerCodeFormControl').disable();
    });


    // this.subscriptions.push(
    //   this.dataEditor.newData.subscribe((result) => {
    //     const data: any = result.data;
    //     if (data && data.uuid && this.isEdit) {
    //       let merchandiser = [];
    //       data?.customer_merchandiser?.forEach(element => {
    //         merchandiser.push({ id: element?.salesman?.id, itemName: `${element?.salesman?.firstname} ${element?.salesman?.lastname} ` });//- ${element?.salesman?.salesman_code}
    //       });
    //       this.editData = result.data.custom_field_value_save;
    //       this.firstnameFormControl.setValue(
    //         data.user ? data.user.firstname : ''
    //       );
    //       this.imageFormControl.setValue(
    //         data.profile_image ? data.profile_image : ''
    //       );
    //       if (data.profile_image !== '' && data.profile_image !== null) {
    //         this.selectedFiles.push(data.profile_image);
    //       }
    //       this.lastnameFormControl.setValue(
    //         data.user ? data.user.lastname : ''
    //       );
    //       this.emailFormControl.setValue(data.user ? data.user.email : '');
    //       this.phoneNumberFormControl.setValue(
    //         data.user ? data.user.mobile : ''
    //       );
    //       this.passwordFormControl.setValue(
    //         data.user ? data.user.password : ''
    //       );
    //       this.customerCodeFormControl.setValue(
    //         data.customer_code ? data.customer_code : ''
    //       );
    //       this.customertypeFormControl.setValue(
    //         data.customer_type_id ? data.customer_type_id : ''
    //       );
    //       this.officeAddressFormControl.setValue(
    //         data.customer_address_1 ? data.customer_address_1 : ''
    //       );
    //       this.office_lat = data.customer_address_1_lat
    //         ? data.customer_address_1_lat
    //         : 0.0;
    //       this.office_lang = data.customer_address_1_lang
    //         ? data.customer_address_1_lang
    //         : 0.0;
    //       this.homeAddressFormControl.setValue(
    //         data.customer_address_2 ? data.customer_address_2 : ''
    //       );
    //       this.home_lat = data.customer_address_2_lat
    //         ? data.customer_address_2_lat
    //         : 0.0;
    //       this.home_lang = data.customer_address_2_lang
    //         ? data.customer_address_2_lang
    //         : 0.0;
    //       this.customerCityFormControl.setValue(
    //         data.customer_city ? data.customer_city : ''
    //       );
    //       this.customerStateFormControl.setValue(
    //         data.customer_state ? data.customer_state : ''
    //       );
    //       this.customerZipCodeFormControl.setValue(
    //         data.customer_zipcode ? data.customer_zipcode : ''
    //       );
    //       this.customerPhoneFormControl.setValue(
    //         data.customer_phone ? data.customer_phone : ''
    //       );
    //       this.balanceFormControl.setValue(data.balance ? data.balance : '');
    //       this.merchandiserFormControl.setValue(
    //         merchandiser
    //       );
    //       this.creditLimitFormControl.setValue(
    //         data.credit_limit ? data.credit_limit : ''
    //       );
    //       this.creditdaysFormControl.setValue(
    //         data.payment_term_id ? data.payment_term_id : ''
    //       );
    //       //console.log(this.creditdaysFormControl.value);
    //       this.userTypeFormControl.setValue(
    //         data.user ? data.user.usertype : ''
    //       );
    //       this.parentIdFormControl.setValue(data.parentId ? data.parentId : '');
    //       this.countryIdFormControl.setValue(
    //         data.user ? data.user.country_id : ''
    //       );
    //       this.roleIdFormControl.setValue(data.route_id ? data.route_id : '');
    //       this.regionIdFormControl.setValue(
    //         data.region_id ? data.region_id : ''
    //       );
    //       this.salesOrganizationIdFormControl.setValue(
    //         data.sales_organisation_id ? data.sales_organisation_id : ''
    //       );
    //       this.customerGroupIdFormControl.setValue(
    //         data.customer_group_id ? data.customer_group_id : ''
    //       );
    //       //ship to party ,bill to party, payer,sold to party
    //       this.shipToPartyFormControl.setValue(
    //         data.ship_to_party ? data.customer_code : ''
    //       );
    //       this.soldToPartyFormControl.setValue(
    //         data.sold_to_party ? data.customer_code : ''
    //       );
    //       this.payerFormControl.setValue(data.payer ? data.customer_code : '');
    //       this.billToPartyFormControl.setValue(
    //         data.bill_to_payer?.id ? data.customer_code : ''
    //       );
    //       this.channelFormControl.setValue(
    //         data.channel_id ? data.channel_id : ''
    //       );
    //       this.subchannelFormControl.setValue(
    //         data.sub_channel_id ? data.sub_channel_id : ''
    //       );
    //       this.customerCategoryFormControl.setValue(
    //         data.customer_category_id ? data.customer_category_id : ''
    //       );
    //       this.customerData = data;
    //       this.isEdit = true;
    //       this.getthevalue(true);
    //     }
    //   })
    // );

    // this.filteredOptions = this.shipToPartyFormControl.valueChanges.pipe(
    //   startWith(''),
    //   map((value) => this._filter(value))
    // );
  }

  getNextComingCode() {
    let nextNumber = {
      function_for: 'customer',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.setCustomerCode(res.data);
      }
    });
  }

  fileChosen(event) {
    let files = [];
    if (event.target.files && event.target.files[0]) {
      let filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          files.push(event.target.result);
        };

        reader.readAsDataURL(event.target.files[i]);
      }
      this.selectedFiles = files;
      this.filechoosed = true;
    }
  }
  selectednewFiles(event) {
    let files = [];
    if (event.target.files && event.target.files[0]) {
      let filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        this.fileNames.push(event.target.files[i].name);
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.selectedDoc.push(event.target.result);
        }
        reader.readAsDataURL(event.target.files[i]);
      }
    }
  }
  removeSelctedFiles(i) {
    this.fileNames.splice(i, 1);
    this.selectedDoc.splice(i, 1);
  }

  initOfficeSearch() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        this.officeSrch.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          this.officeAddressFormControl.setValue(
            this.officeSrch.nativeElement.value
          );
          this.office_lat = place.geometry.location.lat();
          this.office_lang = place.geometry.location.lng();
        });
      });
    });
  }

  initHomeSearch() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        this.homeSrch.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          this.homeAddressFormControl.setValue(
            this.homeSrch.nativeElement.value
          );
          this.home_lat = place.geometry.location.lat();
          this.home_lang = place.geometry.location.lng();
        });
      });
    });
  }

  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }
  onFocusOutEvent(e: any) {
    let formArray = this.getLobCustomerInfo;
    formArray.controls[0].get('shipToParty').setValue(e.target.value);
    formArray.controls[0].get('soldToParty').setValue(e.target.value);
    formArray.controls[0].get('payer').setValue(e.target.value);
    formArray.controls[0].get('billToParty').setValue(e.target.value);
  }
  buildForm(data?) {
    this.customerFormGroup = this.fb.group({
      customerLobType: new FormControl(data?.is_lob && "" + data?.is_lob || '0'),
      rebateTypeFormControl: new FormControl(data?.rebate + "" || '0'),
      customerLob: new FormControl([]),
      imageFormControl: new FormControl(''),
      firstnameFormControl: new FormControl(data?.user?.firstname || '', [Validators.required]),
      lastnameFormControl: new FormControl(data?.user?.lastname || ''),
      emailFormControl: new FormControl(data?.user?.email || '', [Validators.required]),
      customerCodeFormControl: new FormControl(data?.customer_code || '', [Validators.required]),
      phoneNumber: new FormControl(data?.customer_phone || ''),
      password: new FormControl(data?.password || ''),
      officeAddress: new FormControl(data?.customer_address_1 || '', [Validators.required]),
      homeAddress: new FormControl(data?.customer_address_2 || ''),
      customerCity: new FormControl(data?.customer_city || ''),
      customerState: new FormControl(data?.customer_state || ''),
      customerZipCode: new FormControl(data?.customer_zipcode || ''),
      expired_date: new FormControl(data?.expired_date || ''),
      customerPhone: new FormControl(data?.customer_phone || ''),
      erpCode: new FormControl(data?.erp_code || ''),
      trn_no: new FormControl(data?.trn_no || ''),
      customerGroupId: new FormControl(data?.customer_group_id || ''),
      lobCustomerInfo: this.fb.array([]),
      orderBlockCheck: new FormControl(data?.customer_block_types.find(x => x.type == "")?.is_block == 1 || false),
      salesBlockCheck: new FormControl(data?.customer_block_types.find(x => x.type == "Sales")?.is_block == 1 || false),
      returnBlockCheck: new FormControl(data?.customer_block_types.find(x => x.type == "Return")?.is_block == 1 || false),
      creditLimitBlockCheck: new FormControl(data?.customer_block_types.find(x => x.type == "Credit Limit")?.is_block == 1 || false),

    })
    let formArray = this.getLobCustomerInfo;
    if (data?.is_lob && data?.is_lob == '1') {
      let lobArray = [];
      data?.customerlob.forEach((element, index) => {
        lobArray.push(this.getLobById(element.lob_id));
        console.log(this.customerFormGroup.get('customerLob').value);
        formArray.push(this.createCustomerFormArray(data?.is_lob, element.lob_id, element));
        // formArray.controls[index]['controls'].countryId.valueChanges.subscribe(selectedValue => {
        //   console.log('lob country', selectedValue)
        //   this.getRegionList(selectedValue);
        // })
        this.getthevalue(index, true);
        setTimeout(() => {
          this.channelSelected(element.channel, index);
          this.salesOrganisationSelected(element.sales_organisation, index);
          this.customerCategorySelected(element.customer_category, index);
        }, 500);
      });
      this.customerFormGroup.patchValue({
        customerLob: lobArray
      });
    } else {
      if (data) {
        let index = 0;
        formArray.push(this.createCustomerFormArray('0', index, data));
        // formArray.controls[index]['controls'].countryId.valueChanges.subscribe(selectedValue => {
        //   console.log('centralized country', selectedValue)
        //   this.getRegionList(selectedValue);
        // })
        this.getthevalue(index, true);
        formArray.at(index).get('channel').setValue(data.channel_id);
        setTimeout(() => {
          this.channelSelected(data.channel, index);
          this.salesOrganisationSelected(data.sales_organisation, index);
          this.customerCategorySelected(data.customer_category, index);
        }, 500);
      } else {
        formArray.push(this.createCustomerFormArray('0'));
      }

    }

    console.log(this.customerFormGroup);
    // let formArray2 = this.getLobCustomerInfo;
    // formArray2.controls[0]['controls'].countryId.valueChanges.subscribe(selectedValue => {
    //   this.getRegionList(selectedValue);
    // })

    // this.customerFormGroup['controls']['returnBlockCheck'].valueChanges.subscribe(x => {
    //   console.log("x", x)
    // });

    this.returnBlockCheck.valueChanges.subscribe(x => {
      console.log("x", x)
    });
  }

  get getLobCustomerInfo() {
    return this.customerFormGroup.get('lobCustomerInfo') as FormArray;
  }


  getLobById(id) {
    return this.customerLobList.find((x) => x.id == id);
  }

  createCustomerFormArray(lobType, lobId = 0, data?) {
    let merchandiser = [];
    if (data?.customer_merchandiser)
      data?.customer_merchandiser?.forEach(element => {
        merchandiser.push({ id: element?.salesman?.id, itemName: `${element?.salesman?.firstname} ${element?.salesman?.lastname} ` });//- ${element?.salesman?.salesman_code}
      });

    var route_ids = [];
    if (data?.customer_route)
      data?.customer_route.forEach(element => {
        route_ids.push(element.route_id);
      });
    if (data)
      data.route_id = route_ids;

    console.log(lobType, data?.user?.country_id);
    let formGroup = this.fb.group({
      lob: [lobType],
      lobName: [this.getLobById(lobId)?.name || 'Centralized'],
      lobId: [lobId],
      customertype: new FormControl(data?.customer_type_id || '', [Validators.required]),
      balance: new FormControl(data?.balance || ''),
      merchandiserId: new FormControl(merchandiser || ''),
      creditLimit: new FormControl(data?.credit_limit || ''),
      creditdays: new FormControl(data?.payment_term_id || ''),
      due_on: new FormControl(data?.due_on || ''),
      userType: new FormControl(data?.user?.usertype || ''),
      parentId: new FormControl(data?.parentId || ''),
      countryId: new FormControl(data?.country_id || data?.user_country?.country_id || ''),
      regionId: new FormControl(data?.region_id || ''),
      routeId: new FormControl(data?.route_id || []),
      salesOrganizationId: new FormControl('', [Validators.required]),
      shipToParty: new FormControl(data?.ship_to_party ? data.ship_to_party.customer_code : ''),
      soldToParty: new FormControl(data?.sold_to_party ? data.sold_to_party.customer_code : ''),
      payer: new FormControl(data?.payer ? data.payer.customer_code : ''),
      billToParty: new FormControl(data?.bill_to_payer?.id ? data.bill_to_payer.customer_code : ''),
      channel: new FormControl('', [Validators.required]),
      subchnel: new FormControl(data?.sub_channel_id || ''),
      customerCategory: new FormControl('', [Validators.required]),
      amount: new FormControl(data?.amount || ''),
      orderBlockCheck: new FormControl(data?.customer_block_types?.find(x => x.type == "")?.is_block == 1 || false),
      salesBlockCheck: new FormControl(data?.customer_block_types?.find(x => x.type == "Sales")?.is_block == 1 || false),
      returnBlockCheck: new FormControl(data?.customer_block_types?.find(x => x.type == "Return")?.is_block == 1 || false),
      creditLimitBlockCheck: new FormControl(data?.customer_block_types?.find(x => x.type == "Credit Limit")?.is_block == 1 || false),
    });
    formGroup.get('countryId').valueChanges.subscribe((selectedValue) => {
      this.getRegionList(selectedValue);
    })
    let countryId = data?.country_id || data?.user_country?.country_id;
    this.getRegionList(countryId);
    if (this.domain == 'vansales' || this.domain == 'presales') {
      formGroup.get('routeId').setErrors({ required: true });
    } else {
      formGroup.get('routeId').setErrors(null);
    }
    console.log(formGroup);
    return formGroup;
  }

  onSelcetCustomerLobType(value) {
    console.log(value);
    let formArray = this.getLobCustomerInfo;
    this.resetLobCustomerInfo(formArray);
    this.customerFormGroup.get('customerLob').setValue('');
    if (value == '0') {
      formArray.push(this.createCustomerFormArray('0'));
      formArray.controls[0].get('shipToParty').setValue(this.customerFormGroup.get('customerCodeFormControl').value);
      formArray.controls[0].get('soldToParty').setValue(this.customerFormGroup.get('customerCodeFormControl').value);
      formArray.controls[0].get('payer').setValue(this.customerFormGroup.get('customerCodeFormControl').value);
      formArray.controls[0].get('billToParty').setValue(this.customerFormGroup.get('customerCodeFormControl').value);
      // formArray.controls[0]['controls'].countryId.valueChanges.subscribe(selectedValue => {
      //   this.getRegionList(selectedValue);
      // })
    }
  }

  resetLobCustomerInfo(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }

  onSelectLob(lob) {
    let formArray = this.getLobCustomerInfo;
    if (lob.length != 0) {
      lob.forEach((item) => {
        let filterLob = formArray.value.filter((x) => x.lobName == item.name);
        if (filterLob.length == 0) {
          formArray.push(this.createCustomerFormArray('1', item.id));
          formArray.controls[0].get('shipToParty').setValue(this.customerFormGroup.get('customerCodeFormControl').value);
          formArray.controls[0].get('soldToParty').setValue(this.customerFormGroup.get('customerCodeFormControl').value);
          formArray.controls[0].get('payer').setValue(this.customerFormGroup.get('customerCodeFormControl').value);
          formArray.controls[0].get('billToParty').setValue(this.customerFormGroup.get('customerCodeFormControl').value);
          // formArray.controls[0]['controls'].countryId.valueChanges.subscribe(selectedValue => {
          //   this.getRegionList(selectedValue);
          // })
        }
      })
      formArray.value.forEach((formElem) => {
        let lobElem = lob.filter((x) => x.name == formElem.lobName);
        if (lobElem.length == 0) {
          let index = formArray.value.findIndex((x) => x.lobName == formElem.lobName);
          formArray.removeAt(index);
        }
      })
    } else {
      if (formArray.value.length > 0) {
        formArray.removeAt(0);
      }
    }
  }

  onCustomFieldUpdated(item) {
    if (Array.isArray(item)) {
      this.customFields = item;
    }
  }
  getCustomFieldStatus() {
    this.apiService
      .checkCustomFieldStatus({
        organisation_id: APP.ORGANIZATION,
        module_id: this.moduleId,
      })
      .subscribe((response) => {
        this.isCustomField =
          response.data.custom_field_status == 0 ? false : true;
      });
  }
  validateCustomFields() {
    let isValid;
    const modules = this.customFields.map((item) => {
      const value =
        item.fieldType == 'multi_select'
          ? item.fieldValue.toString()
          : item.fieldValue;
      return {
        module_id: item.moduleId,
        custom_field_id: item.id,
        custom_field_value: value,
      };
    });
    isValid = modules.find(
      (module) =>
        module.custom_field_value === undefined ||
        module.custom_field_value === ''
    );
    if (isValid) {
      this.commonToasterService.showWarning(
        'Warning',
        'Please fill all custom fields.'
      );
      return false;
    }
    return modules;
  }
  getRegionList(id) {
    var regionArr = [];
    console.log('out loop')
    this.formPopulateData?.region?.forEach(element => {
      console.log(id, element.country_id);
      if (id == element.country_id) {
        console.log('in loop')
        regionArr.push(element);
      }
    });
    this.regionList = [...regionArr];
    console.log('regionList', this.regionList)
  }
  loadFormData() {
    const formData = this.formPopulateData;
    this.areas = formData.route;
    this.channels = formData.channel;
    this.salesOrganisationsList = formData.sales_organisation;
    var data = [];
    data.push(formData.org_country)
    this.countryList = formData.org_country;
    this.merchandiserList = formData.merchandiser.map(item => {
      if (item.user !== null) {
        item['user']['lastname'] = [item.user?.lastname, item.salesman_code].join(" - ")
        return item;
      }
      return item;
    });
    this.paymentOptions = formData.payment_term;
    this.customerCategoryList = formData.customer_category;
    // this.customerID = this.route.snapshot.data[
    //   'customer_resolve'
    // ].customerList.data;

  }

  getCustomerDataList() {
    return this.masterService.customerDetailListTable({ page: 1, page_size: 10 }).subscribe((result) => {
      this.customerID = result.data;
      this.filterCustomerId = this.customerID;
      this.filterCustomerId1 = this.customerID;
    });
  }

  setCustomerCode(code: any) {
    if (code?.number_is !== null) {
      this.nextCommingNumberofCustomerCode = code.number_is;
      this.nextCommingNumberofCustomerCodePrefix = code.prefix_is;
      this.customerFormGroup.get('customerCodeFormControl').setValue(
        this.nextCommingNumberofCustomerCode
      );
      this.customerFormGroup.get('customerCodeFormControl').disable();
      let formArray = this.getLobCustomerInfo;
      formArray.controls[0].get('shipToParty').setValue(this.nextCommingNumberofCustomerCode);
      formArray.controls[0].get('soldToParty').setValue(this.nextCommingNumberofCustomerCode);
      formArray.controls[0].get('payer').setValue(this.nextCommingNumberofCustomerCode);
      formArray.controls[0].get('billToParty').setValue(this.nextCommingNumberofCustomerCode);
    } else {
      this.nextCommingNumberofCustomerCode = '';
      this.customerFormGroup.get('customerCodeFormControl').enable();
    }
  }

  public close() {
    this.fds.close();
    this.customerFormGroup.reset();
    this.filechoosed = false;
    this.selectedFiles = [];
    this.selectedDoc = [];
    this.nextCommingNumberofCustomerCode = '';
    this.customerData = {};
  }

  public saveCustomerData(): void {
    this.formSubmit = false
    console.log(this.customerFormGroup, this.customerFormGroup.invalid);
    if (this.customerFormGroup.invalid) {
      this.formSubmit = true
      return;
    }
    if (this.isEdit) {
      this.editCustomer();
    } else {
      this.postCustomerData();
    }
  }

  public openChannel(index): void {
    this.dialog
      .open(ChannelComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        this.apiService
          .getAllChannels()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((channels) => {
            this.channels = channels;
          });
        if (!result) {
          return;
        }
        let customerInfo = this.getLobCustomerInfo;
        customerInfo.at(index).get('channel').setValue(result.id);
      });
  }

  public openSalesOrganisation(index): void {
    this.dialog
      .open(SalesOrganisationFormComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        this.apiService
          .getAllSalesOrganisations()
          .pipe(map((apiResult) => apiResult.data))
          .subscribe((salesOrganisations) => {
            this.salesOrganisationsList = salesOrganisations;
          });
        if (!result) {
          return;
        }
        let customerInfo = this.getLobCustomerInfo;
        customerInfo.at(index).get('salesOrganizationId').setValue(result.id);
      });
  }
  public openCustomerCategory(index): void {
    this.dialog
      .open(CustomerCategoryFormComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        console.log(result, this.customerCategoryList);
        this.apiService.getAllCustomerCategory().subscribe((item) => {
          this.customerCategoryList = item;
          let customerInfo = this.getLobCustomerInfo;
          customerInfo.at(index).get('customerCategory').setValue(result.id);
        });

        // // console.log('index', index, customerInfo.at(index).get('customerCategory').value)
      });
  }
  public channelProvider(): Observable<any[]> {
    return this.apiService.getAllChannels().pipe(map((result) => result.data));
  }

  public channelSelected(data: any, index): void {
    let formArray = this.getLobCustomerInfo;
    let formGroup = formArray.at(index);
    formGroup.get('channel').setValue(data.id);
    // this.channelFormControl.setValue(data.id);
  }
  public salesOrganisationProvider(): Observable<any[]> {
    return this.apiService
      .getAllSalesOrganisations()
      .pipe(map((result) => result.data));
  }
  public customerCategoryProvider(): Observable<any[]> {
    return this.apiService
      .getAllCustomerCategory()
      .pipe(map((result) => result.data));
  }

  public salesOrganisationSelected(data: any, index): void {
    let formArray = this.getLobCustomerInfo;
    let formGroup = formArray.at(index);
    formGroup.get('salesOrganizationId').setValue(data.id);
    // this.salesOrganizationIdFormControl.setValue(data.id);
  }
  public customerCategorySelected(data: any, index): void {
    let formArray = this.getLobCustomerInfo;
    let formGroup = formArray.at(index);
    formGroup.get('customerCategory').setValue(data.id);
    // this.customerCategoryFormControl.setValue(data.id);
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  setCodeData(formControl: FormControl) {
    // //console.log(formControl.value, this.customerCodeFormControl.value)
    if (
      this.customerFormGroup.get('customerCodeFormControl').value &&
      formControl.value == this.customerFormGroup.get('customerCodeFormControl').value
    ) {
      if (this.nextCommingNumberofCustomerCode !== '') {
        formControl.setValue(this.nextCommingNumberofCustomerCode);
      } else if (this.nextCommingNumberofCustomerCode == '') {
        if (this.customerFormGroup.get('customerCodeFormControl').value) {
          formControl.setValue(this.customerFormGroup.get('customerCodeFormControl').value);
        }
      }
    }
  }

  // search(val) {
  //   console.log('VAl', val);
  //   if (val == '') {

  //   } else {
  //     this.filterCustomerId = this.filterCustomerId.filter((item, i) => {
  //       return item.toLowerCase().includes(item.customer_code.toLowerCase());
  //     });
  //   }
  // }
  search(query) {
    this.filterCustomerId = [];
    if (query !== '') {
      let result = this.select(query)
      this.filterCustomerId = result;
    } else {
      this.filterCustomerId = this.filterCustomerId1;
    }
  }

  select(query) {
    let result = [];
    for (let a of this.filterCustomerId1) {
      if (a.customer_code.toLowerCase().includes(query)) {
        console.log(a.customer_code.toLowerCase().includes(query));
        result.push(a);
      }
    }
    return result
  }
  private postCustomerData(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;
    let customerPostForm = this.formMapping(modules);
    console.log('customer Post form', customerPostForm);
    this.apiService
      .addCustomers(customerPostForm)
      .subscribe(
        (result: any) => {
          this.commonToasterService.showSuccess(
            'Customer Saved',
            'Customer has been saved successfully'
          );
          let data = result.data;
          data.edit = false;
          this.updateTableData.emit(data);
          this.close();
        },
        (error) => {
          console.error(error.errors);
        }
      );
  }

  formMapping(modules) {
    let formArray = this.getLobCustomerInfo;
    let customerLob = [];
    formArray.controls.forEach((item) => {
      let payer = item.get('payer') as FormControl;
      let soldToParty = item.get('soldToParty') as FormControl;
      let shipToParty = item.get('shipToParty') as FormControl;
      let billToParty = item.get('billToParty') as FormControl;
      this.setCodeData(payer);
      this.setCodeData(soldToParty);
      this.setCodeData(shipToParty);
      this.setCodeData(billToParty);
      let merchandisers = [];
      let merch = item.get('merchandiserId').value;
      if (merch && merch.length > 0) {
        merch.forEach((el) => {
          merchandisers.push(el.id);
        });
      }
      item.get('merchandiserId').setValue(merchandisers);
      if (
        item.get('creditLimit').value &&
        !item.get('creditdays').value
      ) {
        this.commonToasterService.showSuccess(
          'Validation',
          'Credit days field is required.'
        );
        return;
      } else if (
        !item.get('creditLimit').value &&
        item.get('creditdays').value
      ) {
        this.commonToasterService.showSuccess(
          'Validation',
          'Credit limit field is required.'
        );
        return;
      }

      var blocks: any = [];
      var _blockObj = {
        "type": "",
        "is_block": 0,
        customer_lob_id: 0
      }

      _blockObj = {
        "type": "Order",
        "is_block": item.get('orderBlockCheck').value ? 1 : 0,
        customer_lob_id: item.get('lobId').value,
      }
      blocks.push(_blockObj)
      _blockObj = {
        "type": "Sales",
        "is_block": item.get('salesBlockCheck').value ? 1 : 0,
        customer_lob_id: item.get('lobId').value,
      }
      blocks.push(_blockObj)
      _blockObj = {
        "type": "Return",
        "is_block": item.get('returnBlockCheck').value ? 1 : 0,
        customer_lob_id: item.get('lobId').value,
      }
      blocks.push(_blockObj)
      _blockObj = {
        "type": "Credit Limit",
        "is_block": item.get('creditLimitBlockCheck').value ? 1 : 0,
        customer_lob_id: item.get('lobId').value,
      }
      blocks.push(_blockObj);

      let customerLobObj = {
        lob_id: item.get('lobId').value,
        country_id: item.get('countryId').value,
        region_id: item.get('regionId').value,
        route_id: item.get('routeId').value,
        sales_organisation_id: item.get('salesOrganizationId').value,
        customer_type_id: item.get('customertype').value,
        balance: item.get('balance').value || 0,
        merchandiser_id: item.get('merchandiserId').value,
        credit_limit: item.get('creditLimit').value,
        credit_days: this.selectedPaymentTerm?.number_of_days,
        payer: item.get('payer').value,
        sold_to_party: item.get('soldToParty').value,
        ship_to_party: item.get('shipToParty').value,
        bill_to_payer: item.get('billToParty').value,
        channel_id: item.get('channel').value,
        sub_channel_id: item.get('subchnel').value,
        customer_category_id: item.get('customerCategory').value,
        payment_term_id: item.get('creditdays').value || "",
        due_on: item.get('due_on').value || "",
        amount: item.get('amount').value || 0,
        blocks,
        modules,
      };

      if (this.isEdit) {
        if (this.customerFormGroup.getRawValue().customerLobType == '0') {
          customerLobObj["id"] = this.customerData.customerlob[0]?.id;
        } else {
          customerLobObj["id"] = this.customerData.customerlob.find(x => x.lob_id == customerLobObj.lob_id)?.id;
        }
      }

      customerLob.push(customerLobObj);
    })
    return this.patchCustomerForm(customerLob);
  }

  patchCustomerForm(customerLob) {
    let form = this.customerFormGroup.getRawValue();
    console.log(form);
    var customerPostForm = {
      usertype: '10',
      parent_id: '3',
      customer_code: form.customerCodeFormControl,
      firstname: form.firstnameFormControl,
      customer_group_id: form.customerGroupId || "",
      lastname: form.lastnameFormControl,
      email: form.emailFormControl,
      customer_profile:
        this.filechoosed == true ? this.selectedFiles[0] : undefined,
      is_approved_by_admin: '1',
      status: '1',
      role_id: 1,
      is_lob: +form.customerLobType,
      rebate: form.rebateTypeFormControl,
      mobile: form.customerPhone,
      customer_address_1: form.officeAddress,
      customer_address_1_lat: this.office_lat,
      customer_address_1_lang: this.office_lang,
      customer_address_2: form.homeAddress,
      customer_address_2_lat: this.home_lat,
      customer_address_2_lang: this.home_lang,
      customer_city: form.customerCity,
      customer_state: form.customerState,
      customer_zipcode: form.customerZipCode,
      customer_phone: form.customerPhone,
      erp_code: form.erpCode,
      trn_no: form.trn_no,
      documents: this.selectedDoc,
      expired_date: form.expired_date
    };



    if (form.customerLobType == '1') {
      Object.assign(customerPostForm, {
        customer_lob: customerLob,
      });
    } else {
      Object.assign(customerPostForm, {
        country_id: customerLob[0].country_id,
        region_id: customerLob[0].region_id,
        route_id: customerLob[0].route_id || 0,
        sales_organisation_id: customerLob[0].sales_organisation_id,
        customer_type_id: customerLob[0].customer_type_id,
        balance: customerLob[0].balance || 0,
        merchandiser_id: customerLob[0].merchandiser_id,
        credit_limit: customerLob[0].credit_limit,
        credit_days: customerLob[0].credit_days,
        payer: customerLob[0].payer,
        sold_to_party: customerLob[0].sold_to_party,
        ship_to_party: customerLob[0].ship_to_party,
        bill_to_payer: customerLob[0].bill_to_payer,
        channel_id: customerLob[0].channel_id,
        sub_channel_id: customerLob[0].sub_channel_id,
        customer_category_id: customerLob[0].customer_category_id,
        payment_term_id: customerLob[0].payment_term_id || "",
        amount: customerLob[0].amount || 0,
        modules: customerLob[0].modules,
        blocks: customerLob[0].blocks,
      })
    }
    return customerPostForm;
  }

  private editCustomer(): void {
    const modules = this.validateCustomFields();
    if (!modules) return;
    let customerEditForm = this.formMapping(modules);
    console.log(customerEditForm);
    this.apiService
      .editCustomers(this.customerData.uuid, customerEditForm)
      .subscribe((result: any) => {
        this.commonToasterService.showSuccess(
          'Customer Updated',
          'Customer has been updated successfully'
        );
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.close();
      });
  }

  openDialog() {
    this.dialog
      .open(PayementtermsDialogComponent, {
        width: '650px',
        height: 'auto',
        data: this.paymentOptions,
      })
      .componentInstance.addPaymentTerms.subscribe((res: any) => {
        this.paymentOptions = res;
      });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.customerID.filter((customer) =>
      customer.toLowerCase().includes(filterValue)
    );
  }

  addNewCustomerGroup() {
    let dialogRef = this.dialog.open(AddCustomerGroupComponent, {
      position: {
        top: '0px',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.customerGroupList.push(result);
        this.customerFormGroup.get('customerGroupId').patchValue(result.id);
      }
    });
  }

  getSearchData(index) {
    let customerInfo = this.getLobCustomerInfo;
    let store = customerInfo.at(index).get('shipToParty').value;
    let store1 = customerInfo.at(index).get('soldToParty').value;
    let store2 = customerInfo.at(index).get('payer').value;
    let store3 = customerInfo.at(index).get('billToParty').value;
    //console.log(this.customerID);
    if (store.length && store1.length && store2.length && store3.length) {
      this.filterCustomerId = [];
      this.filterCustomerId = this.customerID.filter((item, i) => {
        return store.toLowerCase().includes(item.customer_code.toLowerCase());
      });
    }
    if (store1.length) {
      this.filterCustomerId = [];
      this.filterCustomerId = this.customerID.filter((item, i) => {
        return store1.toLowerCase().includes(item.customer_code.toLowerCase());
      });
    }
    if (store2.length) {
      this.filterCustomerId = [];
      this.filterCustomerId = this.customerID.filter((item, i) => {
        return store2.toLowerCase().includes(item.customer_code.toLowerCase());
      });
    }
    if (store3.length) {
      this.filterCustomerId = [];
      this.filterCustomerId = this.customerID.filter((item, i) => {
        return store3.toLowerCase().includes(item.customer_code.toLowerCase());
      });
    }
  }

  open() {
    let response: any;
    let data = {
      title: 'Customer Code',
      functionFor: 'customer',
      code: this.nextCommingNumberofCustomerCode,
      prefix: this.nextCommingNumberofCustomerCodePrefix,
      key: this.nextCommingNumberofCustomerCode.length
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
          this.customerFormGroup.get('customerCodeFormControl').setValue('');
          this.nextCommingNumberofCustomerCode = '';
          this.customerFormGroup.get('customerCodeFormControl').enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.customerFormGroup.get('customerCodeFormControl').setValue(
            res.data.next_coming_number_customer
          );
          this.nextCommingNumberofCustomerCode =
            res.data.next_coming_number_customer;
          this.nextCommingNumberofCustomerCodePrefix = res.reqData.prefix_code;
          this.customerFormGroup.get('customerCodeFormControl').disable();
        }
      });
  }

  getthevalue(index: number, edit?: boolean) {
    let customerInfo = this.getLobCustomerInfo;
    if (
      !customerInfo.at(index).get('creditLimit').value ||
      !customerInfo.at(index).get('creditdays').value
    ) {
      return;
    }
    this.selectedPaymentTerm = this.paymentOptions.filter(
      (item) => item.id == customerInfo.at(index).get('creditdays').value
    )[0];
    this.isSelectedIndex = false;
    if (edit) {
      this.selectedIndex.setValue(1);
    }
  };

  public openCustomerLob(): void {
    this.dialog
      .open(SalesmanLobComponent, {
        width: '650px',
        position: {
          top: '0px',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.customerFormGroup.get('customerLobType').setValue([{ id: result.id, itemName: result.name }]);
      });
  }
}
