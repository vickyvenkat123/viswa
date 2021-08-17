import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ApiKeySelectionService } from 'src/app/services/api-key-selection.service';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { PricingPlanService } from '../../../pricing-plan.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-discount-form-key-value',
  templateUrl: './discount-form-key-value.component.html',
  styleUrls: ['./discount-form-key-value.component.scss'],
})
export class DiscountFormKeyValueComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() public overviewFormGroup: FormGroup;
  @Input() public showFormError: boolean;
  @Input() public editData;
  @Input() public selectedIndex: any;

  countries = [];
  regions = [];
  areas = [];
  routes = [];
  salesOrganisations = [];
  channels = [];
  customerCategories = [];
  customers = [];
  majorCategories = [];
  itemGroups = [];
  items = [];
  flatAreaData = [];
  flatChannelData = [];
  flatSalesOrganisationData = [];
  flatCategoryData = [];
  keySequence: string[] = [];

  valuesArray: any[] = [];

  selectedCountries: FormControl;
  selectedRegions: FormControl;
  selectedAreas: FormControl;
  selectedRoutes: FormControl;
  selectedSalesOrganisations: FormControl;
  public lookup$: Subject<any> = new Subject();
  public page = 1;
  public isLoading: boolean;
  public total_pages = 0;
  selectedChannels: FormControl;
  selectedCustomerCategories: FormControl;
  selectedCustomers: FormControl;
  selectedCategories: FormControl;
  selectedItemGroups: FormControl;
  selectedItems: FormControl;

  public keySequenceFromControl: FormControl;

  public countriesFromControl: FormControl;
  public regionsFormControl: FormControl;
  public areasFromControl: FormControl;
  public routeFormControl: FormControl;

  public salesOrganisationFormControl: FormControl;
  public channelFormControl: FormControl;
  public customerCategoryFormControl: FormControl;
  public customerFormControl: FormControl;

  public majorCategoryFormControl: FormControl;
  public itemGroupFormControl: FormControl;
  public itemsFormControl: FormControl;

  private apiService: ApiService;
  private ks: ApiKeySelectionService;
  private router: Router;
  private subscriptions: Subscription[] = [];
  public itemData: any[] = [];
  public itemUomData: any[] = [];
  public uomFilter: any[] = [];
  ItemUomCodeFormControl: FormControl;

  updateItemCode: { index: number; isEdit: boolean };
  ItemCodeFormControl: FormControl;
  public displayedColumns = ['itemName', 'itemUom', 'actions'];
  public itemSource: any;
  private itemCodeList: {
    item_id: number;
    item_uom_id: number;
  }[] = [];
  customersCopy: any = [];

  constructor(
    private planService: PricingPlanService,
    apiService: ApiService,
    ks: ApiKeySelectionService,
    router: Router
  ) {
    Object.assign(this, { apiService, ks, router });
    this.itemSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    let location = [];
    let customer = [];
    let item = [];
    this.subscriptions.push(
      this.overviewFormGroup
        .get('keyCombination')
        .get('locations')
        .valueChanges.subscribe((x) => {
          location = Object.keys(x).filter((id) => {
            return x[id];
          });
        })
    );
    this.subscriptions.push(
      this.overviewFormGroup
        .get('keyCombination')
        .get('customers')
        .valueChanges.subscribe((x) => {
          customer = Object.keys(x).filter((id) => {
            return x[id];
          });
        })
    );
    this.subscriptions.push(
      this.overviewFormGroup
        .get('keyCombination')
        .get('items')
        .valueChanges.subscribe((x) => {
          item = Object.keys(x).filter((id) => {
            return x[id];
          });
        })
    );
    this.subscriptions.push(
      this.overviewFormGroup
        .get('keyCombination')
        .valueChanges.subscribe((x) => {
          //console.log([...location, ...customer, ...item]);
          this.keySequence = [...location, ...customer, ...item];
          this.updateValues(this.keySequence[0]);
          this.keySequenceFromControl.setValue(this.keySequence);
        })
    );
    this.subscriptions.push(
      this.apiService.getMasterDataLists().subscribe((result: any) => {
        this.itemData = result.data.items;
        this.itemUomData = result.data.item_uom;
        console.log(this.itemUomData);
      })
      // this.planService.getItmesLists().subscribe((res: any) => {
      //   this.itemData = res.items.data;
      //   this.itemUomData = res.uoms.data;
      // })
    );
    this.updateCustomers();
    this.updateItems();

    this.keySequenceFromControl = new FormControl();
    this.countriesFromControl = new FormControl([]);
    this.regionsFormControl = new FormControl([]);
    this.areasFromControl = new FormControl([]);
    this.routeFormControl = new FormControl([]);
    this.salesOrganisationFormControl = new FormControl([]);
    this.channelFormControl = new FormControl([]);
    this.customerCategoryFormControl = new FormControl([]);
    this.customerFormControl = new FormControl([]);
    this.majorCategoryFormControl = new FormControl([]);
    this.itemGroupFormControl = new FormControl([]);
    this.itemsFormControl = new FormControl([]);
    this.ItemCodeFormControl = new FormControl([]);
    this.ItemUomCodeFormControl = new FormControl([]);
    this.selectedCountries = new FormControl([]);
    this.selectedRegions = new FormControl([]);
    this.selectedRoutes = new FormControl([]);
    this.selectedAreas = new FormControl([]);
    this.selectedSalesOrganisations = new FormControl([]);
    this.selectedChannels = new FormControl([])
    this.selectedCustomerCategories = new FormControl([]);
    this.selectedCustomers = new FormControl([]);
    this.selectedCategories = new FormControl([]);
    this.selectedItemGroups = new FormControl([]);
    this.selectedItems = new FormControl([]);
    this.buildForm();
  }
  // public ngOnChanges(): void {
  //   if (this.editData) {
  //     this.updateCustomers();
  //     this.updateItems();
  //     let keySequence: string[] = this.overviewFormGroup.get('keySequence')
  //       .value;
  //     //console.log(keySequence);
  //     keySequence.forEach((key) => {
  //       if (key == 'country') {
  //         let countries: any[] = this.editData.p_d_p_countries;
  //         this.selectedCountries = [];
  //         countries.forEach((country) => {
  //           this.selectedCountries.push(country.country.id);
  //         });
  //         this.onCountryChange(event);
  //       }
  //       if (key == 'regions') {
  //         let regions: any[] = this.editData.p_d_p_regions;
  //         this.selectedRegions = [];
  //         regions.forEach((region) => {
  //           this.selectedRegions.push(region.region.id);
  //         });
  //         this.onRegionChange(event);
  //       }
  //       if (key == 'area') {
  //         let areas: any[] = this.editData.p_d_p_areas;
  //         this.selectedAreas = [];
  //         areas.forEach((area) => {
  //           this.selectedAreas.push(area.area.id);
  //         });
  //         if (keySequence.includes('route')) {
  //           this.subscriptions.push(
  //             // this.apiService.getAllRoute().subscribe((res) => {
  //             //   this.valuesArray[this.keySequence.indexOf('area')] = res.data;
  //             //   this.updateData();
  //             // })
  //             // this.subscriptions.push(
  //             this.apiService.getMasterDataLists().subscribe((result: any) => {
  //               this.valuesArray[this.keySequence.indexOf('area')] = result.data.route;
  //               this.updateData();
  //             })
  //             // );
  //           );
  //         }
  //         this.areasFromControl.setValue(this.selectedAreas);
  //       }
  //       if (key == 'route') {
  //         let routes: any[] = this.editData.p_d_p_routes;
  //         this.selectedRoutes = [];
  //         routes.forEach((route) => {
  //           this.selectedRoutes.push(route.route.id);
  //         });
  //         this.routeFormControl.setValue(this.selectedRoutes);
  //       }
  //       if (key == 'salesOrganisation') {
  //         let salesOrgs: any[] = this.editData.p_d_p_sales_organisations;
  //         this.selectedSalesOrganisations = [];
  //         salesOrgs.forEach((salesOrg) => {
  //           this.selectedSalesOrganisations.push(
  //             salesOrg.sales_organisation_id
  //           );
  //         });
  //         this.salesOrganisationFormControl.setValue(
  //           this.selectedSalesOrganisations
  //         );
  //       }
  //       if (key == 'channel') {
  //         let channels: any[] = this.editData.p_d_p_channels;
  //         this.selectedChannels = [];
  //         channels.forEach((channel) => {
  //           this.selectedChannels.push(channel.channel.id);
  //         });
  //         this.channelFormControl.setValue(this.selectedChannels);
  //       }
  //       if (key == 'customerCategory') {
  //         let customerCategories: any[] = this.editData
  //           .p_d_p_customer_categories;
  //         this.selectedCustomerCategories = [];
  //         customerCategories.forEach((customerCategory) => {
  //           this.selectedCustomerCategories.push(
  //             customerCategory.customer_category.id
  //           );
  //         });
  //         this.customerCategoryFormControl.setValue(
  //           this.selectedCustomerCategories
  //         );
  //       }
  //       if (key == 'customer') {
  //         let customers: any[] = this.editData.p_d_p_customers;
  //         this.selectedCustomers = [];
  //         customers.forEach((customer) => {
  //           this.selectedCustomers.push(customer.customer_info.id);
  //         });
  //         this.customerFormControl.setValue(this.selectedCustomers);
  //       }
  //       if (key == 'majorCategory') {
  //         let categories: any[] = this.editData.p_d_p_item_major_categories;
  //         this.selectedCategories = [];
  //         categories.forEach((category) => {
  //           this.selectedCategories.push(category.item_major_category.id);
  //         });
  //         this.majorCategoryFormControl.setValue(this.selectedCategories);
  //       }
  //       if (key == 'itemGroup') {
  //         let itemGroups: any[] = this.editData.p_d_p_item_groups;
  //         this.selectedItemGroups = [];
  //         itemGroups.forEach((itemGroup) => {
  //           this.selectedItemGroups.push(itemGroup.item_group.id);
  //         });
  //         this.itemGroupFormControl.setValue(this.selectedItemGroups);
  //       }
  //       if (key == 'item') {
  //         // let items: any[] = this.editData.p_d_p_items;
  //         // this.selectedItems = [];
  //         // items.forEach((item) => {
  //         //   if (!this.selectedItems.includes(item.item.id)) {
  //         //     this.selectedItems.push(item.item.id);
  //         //   }
  //         // });
  //         let itemUomObj = [];
  //         this.editData.p_d_p_items.forEach((element) => {
  //           itemUomObj.push({
  //             item_id: element.item?.id,
  //             item_name: element.item?.item_name,
  //             item_uom_id: element.item_uom?.id,
  //             item_uom_name: element.item_uom?.name,
  //           });
  //         });
  //         this.updateItemSource(itemUomObj);
  //         this.itemsFormControl.setValue(itemUomObj);
  //       }
  //     });
  //     this.editData = undefined;
  //     //
  //     //
  //     // in progress
  //     //
  //     //
  //     //
  //     //
  //     //       keySequence.forEach(key => {
  //     // //console.log(key);

  //     //       })
  //   } else {
  //   }
  // }

  public ngOnChanges(): void {
    if (this.editData && this.selectedIndex !== 2) {
      let keySequence: string[] = this.overviewFormGroup.get('keySequence')
        .value;
      //console.log(keySequence);
      keySequence.forEach((key) => {
        if (key == 'country') {
          let countries: any[] = this.editData.p_d_p_countries;
          let selectCountry = [];
          countries.forEach((country) => {
            selectCountry.push({
              id: country.country_id,
              itemName: country.country.name
            })
          });
          setTimeout(() => {
            this.selectedCountries.setValue(selectCountry)
            this.onCountryChange(event);
          }, 500);

        }
        if (key == 'regions') {
          let regions: any[] = this.editData.p_d_p_regions;
          let selectedRegion = [];
          regions.forEach((region) => {
            selectedRegion.push({
              id: region.region.id,
              itemName: region.region?.region_name
            })

          });
          setTimeout(() => {
            this.selectedRegions.setValue(selectedRegion)
            this.onRegionChange(event);
          }, 500);

        }
        if (key == 'area') {
          let areas: any[] = this.editData.p_d_p_areas;
          let selectAreas = [];
          areas.forEach((area) => {
            selectAreas.push({
              id: area.area.id,
              itemName: area.area?.area_name
            })

          });
          setTimeout(() => {
            this.selectedAreas.setValue(selectAreas)
            this.onAreaChange(event);
          }, 500);
          if (keySequence.includes('route')) {
            // this.subscriptions.push(
            //   this.apiService.getAllRoute().subscribe((res) => {
            //     this.valuesArray[this.keySequence.indexOf('area')] = res.data;
            //     this.updateData();
            //   })
            // );
            this.subscriptions.push(
              this.apiService.getMasterDataLists().subscribe((result: any) => {
                this.valuesArray[this.keySequence.indexOf('area')] = result.data.route;
                this.updateData();
              }));
          }
        }
        if (key == 'route') {
          let routes: any[] = this.editData.p_d_p_routes;
          let selectRoute = [];
          routes.forEach((route) => {
            selectRoute.push({
              id: route.route.id,
              itemName: route.route?.route_name
            })
          });
          setTimeout(() => {
            this.selectedRoutes.setValue(selectRoute);
            this.onRouteChange(event);
          }, 500);

        }
        if (key == 'salesOrganisation') {
          let salesOrgs: any[] = this.editData.p_d_p_sales_organisations;
          let selectSalesOrganisation = [];
          salesOrgs.forEach((salesOrg) => {
            selectSalesOrganisation.push({
              id: salesOrg.sales_organisation_id,
              itemName: salesOrg.sales_organisation?.name
            })
          });
          setTimeout(() => {
            this.selectedSalesOrganisations.setValue(selectSalesOrganisation)
            this.onSalesOrganisationChange()
          }, 500);

        }
        if (key == 'channel') {
          let channels: any[] = this.editData.p_d_p_channels;
          let selectChannel = [];
          channels.forEach((channel) => {
            selectChannel.push({
              id: channel.channel_id,
              itemName: channel.channel?.name
            })
          });
          console.log(selectChannel);
          setTimeout(() => {
            this.selectedChannels.setValue(selectChannel)
            this.onChannelChange()
          }, 500);

        }
        if (key == 'customerCategory') {
          let customerCategories: any[] = this.editData
            .p_d_p_customer_categories;
          let selectCustomerCategory = []
          customerCategories.forEach((customerCategory) => {
            selectCustomerCategory.push({
              id: customerCategory.customer_category?.id,
              itemName: customerCategory.customer_category?.customer_category_name
            })
          });
          console.log(selectCustomerCategory);
          setTimeout(() => {
            this.selectedCustomerCategories.setValue(selectCustomerCategory)
            this.onCustomerCategoryChange()
          }, 500);

        }
        if (key == 'customer') {
          let customers: any[] = this.editData.p_d_p_customers;
          let selectCustomer = [];
          customers.forEach((customer) => {
            selectCustomer.push({
              id: customer.customer_id,
              itemName: customer.customer_info?.user?.firstname + ' ' + customer.customer_info?.user?.lastname
            })
          });
          console.log(selectCustomer);
          setTimeout(() => {
            this.selectedCustomers.setValue(selectCustomer);
            this.onCustomerChange();
          }, 500);

        }
        if (key == 'majorCategory') {
          let categories: any[] = this.editData.p_d_p_item_major_categories;
          let selectCategories = [];
          categories.forEach((category) => {
            selectCategories.push({
              id: category.item_major_category.id,
              itemName: category.item_major_category.name
            })

          });
          setTimeout(() => {
            this.selectedCategories.setValue(selectCategories)
            this.onCategoryChange()
          }, 500);

        }
        if (key == 'itemGroup') {
          let itemGroup: any[] = this.editData.p_d_p_item_groups;
          let selectItemGroup = [];
          itemGroup.forEach((item) => {
            selectItemGroup.push({
              id: item.item_group.id,
              itemName: item.item_group.name
            });
          })
          setTimeout(() => {
            this.selectedItemGroups.setValue(selectItemGroup);
            this.onItemGroupChange()
          }, 500);

        }
        if (key == 'item') {
          let items: any[] = this.editData.p_d_p_items;
          let itemUomObj = [];
          items.forEach((item) => {
            if (!itemUomObj.find((x) => x.id === item.item_id)) {
              itemUomObj.push({
                item_id: item.item?.id,
                item_name: item.item?.item_name,
                item_uom_id: item.item_uom?.id,
                item_uom_name: item.item_uom?.name,
              });
            }
          });
          setTimeout(() => {
            this.updateItemSource(itemUomObj);
            this.itemsFormControl.setValue(itemUomObj);
            this.onItemChange()
          }, 500);

        }
      });
    }
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  counter(i: number) {
    return new Array(i);
  }
  public flatAreaArray(item) {
    this.flatAreaData.push(item);
    if (item.children.length) {
      for (const child of item.children) {
        this.flatAreaArray(child);
      }
    } else {
      return;
    }
  }
  public flatChannelArray(item) {
    this.flatChannelData.push(item);
    if (item.children.length) {
      for (const child of item.children) {
        this.flatChannelArray(child);
      }
    } else {
      return;
    }
  }
  public flatSalesOrganisationArray(item) {
    this.flatSalesOrganisationData.push(item);
    if (item.children.length) {
      for (const child of item.children) {
        this.flatSalesOrganisationArray(child);
      }
    } else {
      return;
    }
  }
  public flatCategoryArray(item) {
    this.flatCategoryData.push(item);
    if (item.children.length) {
      for (const child of item.children) {
        this.flatCategoryArray(child);
      }
    } else {
      return;
    }
  }

  buildForm() {
    this.overviewFormGroup.addControl(
      'keySequence',
      this.keySequenceFromControl
    );
    this.overviewFormGroup.addControl('country_ids', this.countriesFromControl);
    this.overviewFormGroup.addControl('region_ids', this.regionsFormControl);
    this.overviewFormGroup.addControl('area_ids', this.areasFromControl);
    this.overviewFormGroup.addControl('route_ids', this.routeFormControl);
    this.overviewFormGroup.addControl(
      'sales_organisation_ids',
      this.salesOrganisationFormControl
    );
    this.overviewFormGroup.addControl('channel_ids', this.channelFormControl);
    this.overviewFormGroup.addControl(
      'customer_category_ids',
      this.customerCategoryFormControl
    );
    this.overviewFormGroup.addControl('customer_ids', this.customerFormControl);
    this.overviewFormGroup.addControl(
      'item_major_category_ids',
      this.majorCategoryFormControl
    );
    this.overviewFormGroup.addControl(
      'item_group_ids',
      this.itemGroupFormControl
    );
    this.overviewFormGroup.addControl('item_ids', this.itemsFormControl);
  }
  //updates select options for the next selection.
  updateData() {
    this.keySequence.forEach((key) => {
      if (key == 'regions') {
        let index = this.keySequence.indexOf('regions');
        if (index != 0) {
          this.regions = this.valuesArray[index - 1];
        }
      } else if (key == 'area') {
        let index = this.keySequence.indexOf('area');
        if (index != 0) {
          this.areas = this.valuesArray[index - 1];
        }
      } else if (key == 'route') {
        let index = this.keySequence.indexOf('route');
        if (index != 0) {
          this.routes = this.valuesArray[index - 1];
        }
      }
    });
  }
  onCountryChange(event) {
    let selecteCountry = [];
    this.selectedCountries.value.forEach(element => {
      selecteCountry.push(element.id)
    });
    this.countriesFromControl.setValue(selecteCountry);
    let index = this.keySequence.indexOf('country');
    this.valuesArray = this.valuesArray.slice(0, index);
    console.log(this.selectedCountries);
    let nextSelection = this.keySequence[
      this.keySequence.indexOf('country') + 1
    ];
    //console.log(this.valuesArray);
    if (nextSelection == 'regions') {
      let data = { country_id: this.countriesFromControl.value, param: 'regions' };
      // this.ks.getCountries(data).subscribe(res => {
      //   this.valuesArray[this.keySequence.indexOf('country')] = res.data;
      //   this.updateData();
      // })
      this.subscriptions.push(
        this.apiService.getAllRegions().subscribe((res) => {
          this.valuesArray[this.keySequence.indexOf('country')] = res.data;
          this.updateData();
        })
      );
    } else if (nextSelection == 'area') {
      let data = { country_id: this.countriesFromControl.value, param: 'area' };
      // this.ks.getCountries(data).subscribe(res => {
      //   this.valuesArray[this.keySequence.indexOf('country')] = res.data;
      //   this.updateData();
      // })
      this.subscriptions.push(
        this.apiService.getAllAreas().subscribe((res) => {
          this.flatAreaData = [];
          this.areas = res.data;
          this.areas.forEach((data) => {
            this.flatAreaArray(data);
          });
          this.valuesArray[
            this.keySequence.indexOf('country')
          ] = this.flatAreaData;
          this.updateData();
        })
      );
    } else if (nextSelection == 'route') {
      let data = { country_id: this.countriesFromControl.value, param: 'routes' };

      // this.subscriptions.push(
      //   this.apiService.getAllRoute().subscribe((res) => {
      //     this.valuesArray[this.keySequence.indexOf('country')] = res.data;
      //     this.updateData();
      //   })
      // );
      this.subscriptions.push(
        this.apiService.getMasterDataLists().subscribe((result: any) => {
          this.valuesArray[this.keySequence.indexOf('country')] = result.data.route;
          this.updateData();
        }));
    }
  }
  onRegionChange(event) {
    let selecteRegion = [];
    this.selectedRegions.value.forEach(element => {
      selecteRegion.push(element.id)
    });
    this.regionsFormControl.setValue(selecteRegion);
    let index = this.keySequence.indexOf('regions');
    this.valuesArray = this.valuesArray.slice(0, index);
    //console.log(this.selectedRegions);
    let nextSelection = this.keySequence[
      this.keySequence.indexOf('regions') + 1
    ];
    //console.log(nextSelection);

    //console.log(this.valuesArray);

    if (nextSelection == 'area') {
      let data = { region_id: this.selectedRegions, param: 'area' };

      this.subscriptions.push(
        this.apiService.getAllAreas().subscribe((res) => {
          this.flatAreaData = [];
          this.areas = res.data;
          this.areas.forEach((data) => {
            this.flatAreaArray(data);
          });
          this.valuesArray[
            this.keySequence.indexOf('regions')
          ] = this.flatAreaData;
          this.updateData();
        })
      );
    } else if (nextSelection == 'route') {
      let data = { region_id: this.selectedRegions, param: 'routes' };

      // this.subscriptions.push(
      //   this.apiService.getAllRoute().subscribe((res) => {
      //     this.valuesArray[this.keySequence.indexOf('regions')] = res.data;
      //     this.updateData();
      //   })
      // );
      this.subscriptions.push(
        this.apiService.getMasterDataLists().subscribe((result: any) => {
          this.valuesArray[this.keySequence.indexOf('regions')] = result.data.route;
          this.updateData();
        }));

    }
  }
  onAreaChange(event) {
    // for (let i = 0; i < 6; i++) {
    //   this.selectedAreas.forEach((selectedArea) => {
    //     this.flatAreaData.forEach((area) => {
    //       if (selectedArea === area.parent_id) {
    //         if (!this.selectedAreas.includes(area.id)) {
    //           this.selectedAreas = [...this.selectedAreas, area.id];
    //         }
    //       }
    //     });
    //   });
    // }

    let selecteArea = [];
    this.selectedAreas.value.forEach(element => {
      selecteArea.push(element.id)
    });

    this.areasFromControl.setValue(selecteArea);
    let index = this.keySequence.indexOf('area');
    this.valuesArray = this.valuesArray.slice(0, index);
    //console.log(this.selectedAreas);
    let nextSelection = this.keySequence[this.keySequence.indexOf('area') + 1];
    //console.log(this.valuesArray);

    if (nextSelection == 'route') {
      let data = { area_id: this.selectedAreas, param: 'routes' };

      // this.subscriptions.push(
      //   this.apiService.getAllRoute().subscribe((res) => {
      //     this.valuesArray[this.keySequence.indexOf('area')] = res.data;
      //     this.updateData();
      //   })
      // );
      this.subscriptions.push(
        this.apiService.getMasterDataLists().subscribe((result: any) => {
          this.valuesArray[this.keySequence.indexOf('area')] = result.data.route;
          this.updateData();
        }));
    }
  }

  // onRouteChange(event) {
  //   let selecteRoute = [];
  //   this.selectedRoutes.value.forEach(element => {
  //     selecteRoute.push(element.id)
  //   });

  //   this.routeFormControl.setValue(selecteRoute);
  //   var array = [];
  //   this.selectedRoutes.value.forEach(element => {
  //     this.customersCopy.filter((x) => {
  //       if (x['customer_info'].route_id == element) {
  //         array.push(x);
  //       }
  //     });
  //   });
  //   if (array.length) {
  //     this.customers = array;
  //   } else {
  //     this.customers = this.customersCopy;
  //   }
  // }
  onRouteChange(event) {
    let selecteRoute = [];
    this.customers = [];
    this.selectedRoutes.value.forEach(element => {
      selecteRoute.push(element.id)
    });

    this.routeFormControl.setValue(selecteRoute);
    var array = [];
    if (selecteRoute.length > 0) {
      this.apiService.getCustomersByRouteIds(selecteRoute).subscribe(res => {
        if (res.data.length > 0) {
          res.data.forEach(element => {
            this.customers.push({
              id: element.user_id,
              itemName: element.user.firstname + ' ' + element.user.lastname + ' - ' + element.customer_code,
            });
          });
        }
        setTimeout(() => {
          this.setCustomersList();

        }, 500);
      });
    }
    else {
      this.customers = this.customersCopy;
      setTimeout(() => {
        this.setCustomersList();

      }, 500);
    }
  }
  onSalesOrganisationChange() {
    // for (let i = 0; i < 6; i++) {
    //   this.selectedSalesOrganisations.forEach((selectedSalesOrganisation) => {
    //     this.flatSalesOrganisationData.forEach((salesOrg) => {
    //       if (selectedSalesOrganisation === salesOrg.parent_id) {
    //         if (!this.selectedSalesOrganisations.includes(salesOrg.id)) {
    //           this.selectedSalesOrganisations = [
    //             ...this.selectedSalesOrganisations,
    //             salesOrg.id,
    //           ];
    //         }
    //       }
    //     });
    //   });
    // }
    let selecteSalesOrg = [];
    this.selectedSalesOrganisations.value[0].forEach(element => {
      selecteSalesOrg.push(element.id)
    });
    this.salesOrganisationFormControl.setValue(selecteSalesOrg);
  }
  onScroll() {
    if (this.total_pages < this.page) return;
    this.isLoading = true;
    this.lookup$.next(this.page);
  }
  onChannelChange() {
    // for (let i = 0; i < 6; i++) {
    //   this.selectedChannels.forEach((selectedChannel) => {
    //     this.flatChannelData.forEach((channel) => {
    //       if (selectedChannel === channel.parent_id) {
    //         if (!this.selectedChannels.includes(channel.id)) {
    //           this.selectedChannels = [...this.selectedChannels, channel.id];
    //         }
    //       }
    //     });
    //   });
    // }
    let selectChannel = [];
    this.selectedChannels.value[0].forEach(element => {
      selectChannel.push(element.id)
    });
    this.channelFormControl.setValue(selectChannel);
  }
  onCustomerCategoryChange() {
    let selectCustomerCategory = [];
    this.selectedCustomerCategories.value.forEach(element => {
      selectCustomerCategory.push(element.id)
    });
    this.customerCategoryFormControl.setValue(selectCustomerCategory);
  }
  onCustomerChange() {
    let selectCustomer = [];
    this.selectedCustomers.value.forEach(element => {
      selectCustomer.push(element.id)
    });
    this.customerFormControl.setValue(selectCustomer);
  }

  onCategoryChange() {
    // for (let i = 0; i < 6; i++) {
    //   this.selectedCategories.forEach((selectedCategory) => {
    //     this.flatCategoryData.forEach((category) => {
    //       if (selectedCategory === category.parent_id) {
    //         if (!this.selectedCategories.includes(category.id)) {
    //           this.selectedCategories = [
    //             ...this.selectedCategories,
    //             category.id,
    //           ];
    //         }
    //       }
    //     });
    //   });
    // }
    let selectMajorCategory = [];
    this.selectedCategories.value.forEach(element => {
      selectMajorCategory.push(element.id)
    });
    this.majorCategoryFormControl.setValue(selectMajorCategory);
  }
  onItemGroupChange() {
    let selectItemGroup = [];
    this.selectedItemGroups.value.forEach(element => {
      selectItemGroup.push(element.id)
    });
    this.itemGroupFormControl.setValue(selectItemGroup);
  }

  onItemChange() {
    let selectedItemId = this.selectedItems.value[0]?.id;
    this.ItemCodeFormControl.setValue(selectedItemId);
    this.getUomListByItem(selectedItemId);
  }
  updateValues(option) {
    switch (option) {
      case 'country':
        {
          this.subscriptions.push(
            this.apiService.getCountriesList().subscribe((result: any) => {
              this.countries = result.data;
            })
          );
        }
        break;

      case 'regions':
        this.subscriptions.push(
          this.apiService.getAllRegions().subscribe((result: any) => {
            this.regions = result.data;
          })
        );
        break;

      case 'area':
        this.subscriptions.push(
          this.apiService.getAllAreas().subscribe((result: any) => {
            this.flatAreaData = [];
            this.areas = result.data;
            this.areas.forEach((data) => {
              this.flatAreaArray(data);
            });
          })
        );
        break;
      case 'route':
        this.subscriptions.push(
          // this.apiService.getAllRoute().subscribe((result: any) => {
          //   this.routes = result.data;
          // })
          this.apiService.getMasterDataLists().subscribe((result: any) => {
            this.routes = result.data.route;
          })
        );
        break;
    }
  }
  updateCustomers() {
    this.subscriptions.push(
      this.apiService.getAllSalesOrganisations().subscribe((result: any) => {
        this.salesOrganisations = result.data;
        this.flatSalesOrganisationData = [];
        this.salesOrganisations.forEach((data) => {
          this.flatSalesOrganisationArray(data);
        });
      })
    );
    this.subscriptions.push(
      this.apiService.getAllChannels().subscribe((result: any) => {
        this.channels = result.data;
        this.flatChannelData = [];
        this.channels.forEach((data) => {
          this.flatChannelArray(data);
        });
      })
    );
    this.subscriptions.push(
      this.apiService.getAllCustomerCategory().subscribe((result: any) => {
        this.customerCategories = result.data;
      })
    );
    this.subscriptions.push(
      this.apiService.getMasterDataListsByItem('customer').subscribe((result: any) => {
        if (!this.selectedRoutes.value || this.selectedRoutes.value.length == 0) {
          result.data.customers.forEach(element => {
            this.customers.push({
              id: element.customer_info.user_id,
              itemName: element.firstname + ' ' + element.lastname + ' - ' + element.customer_info.customer_code,
              route_id: element.customer_info.route_id
            });
          });
          // this.customers = result.data.customers;
          this.customersCopy = this.customers;

          setTimeout(() => {
            this.setCustomersList();
          }, 500);
        } else {
          result.data.customers.forEach(element => {
            this.customersCopy.push({
              id: element.customer_info.user_id,
              itemName: element.firstname + ' ' + element.lastname + ' - ' + element.customer_info.customer_code,
            });
          });
        }

      }));
    // this.subscriptions.push(
    //   // this.apiService.getCustomers().subscribe((result: any) => {
    //   //   this.customers = result.data;
    //   // })
    //   this.apiService.getMasterDataLists().subscribe((result: any) => {
    //     this.customers = result.data.customers;
    //     this.customersCopy = this.customers;
    //   })
    // );
  }
  updateItems() {
    this.subscriptions.push(
      this.apiService.getAllMajorCategorires().subscribe((result: any) => {
        this.majorCategories = result.data;
        this.flatCategoryData = [];
        this.majorCategories.forEach((data) => {
          this.flatCategoryArray(data);
        });
      })
    );
    this.subscriptions.push(
      this.apiService.getAllItemGroups().subscribe((result: any) => {
        this.itemGroups = result.data;
      })
    );
    this.subscriptions.push(
      this.apiService.getAllItems().subscribe((result: any) => {
        this.items = result.data;
      })
      // this.apiService.getMasterDataLists().subscribe((result: any) => {
      //   this.items = result.data.items;
      // })
    );
  }
  showLocations() {
    let locations: any = this.overviewFormGroup.value.keyCombination.locations;
    if (
      locations.area === true ||
      locations.country === true ||
      locations.region === true ||
      locations.route === true ||
      locations.subArea === true
    ) {
      return true;
    } else {
      return false;
    }
  }
  showCustomers() {
    let customers: any = this.overviewFormGroup.value.keyCombination.customers;
    if (
      customers.salesOrganisation === true ||
      customers.channel === true ||
      customers.subChannel === true ||
      customers.customerCategory === true ||
      customers.customer === true
    ) {
      return true;
    } else {
      return false;
    }
  }
  showItems() {
    let items: any = this.overviewFormGroup.value.keyCombination.items;
    if (
      items.majorCategory === true ||
      items.subCategory === true ||
      items.itemGroup === true ||
      items.item == true
    ) {
      return true;
    } else {
      return false;
    }
  }

  getUomListByItem(selectedItemId) {
    let itemFilter = this.itemData.filter(
      (item) => item.id == parseInt(selectedItemId)
    )[0];

    let uomFilter = this.itemUomData.filter(
      (item) => item.id == parseInt(itemFilter['lower_unit_uom_id'])
    );

    let secondaryUomFilterIds = [];
    let secondaryUomFilter = [];
    let itemArray: any[] = [];
    if (itemFilter.item_main_price && itemFilter.item_main_price.length) {
      itemFilter.item_main_price.forEach((item) => {
        secondaryUomFilterIds.push(item.item_uom_id);
      });
      this.itemUomData.forEach((item) => {
        if (secondaryUomFilterIds.includes(item.id)) {
          secondaryUomFilter.push(item);
        }
      });
    }

    if (uomFilter.length && secondaryUomFilter.length) {
      itemArray = [...uomFilter, ...secondaryUomFilter];
    } else if (uomFilter.length) {
      itemArray = [...uomFilter];
    } else if (secondaryUomFilter.length) {
      itemArray = [...secondaryUomFilter];
    }

    this.uomFilter = itemArray;
  }

  public editItemCode(num: number, itemCodeData: any): void {
    this.ItemCodeFormControl.setValue(itemCodeData.item_id);
    this.ItemUomCodeFormControl.setValue(itemCodeData.item_uom_id);
    this.updateItemCode = {
      index: num,
      isEdit: true,
    };
  }

  public deleteItemCode(index: number): void {
    let ItemFormControl = this.itemsFormControl.value;
    ItemFormControl.splice(index, 1);
    this.updateItemSource(ItemFormControl);
    this.overviewFormGroup.addControl('item_ids', this.itemsFormControl);

  }

  public addItemCode(): void {
    if (this.updateItemCode && this.updateItemCode.isEdit) {
      this.updateExistingItemCode(
        this.updateItemCode && this.updateItemCode.index
      );
    }
    let ItemFormControl =
      this.itemsFormControl.value == null ? [] : this.itemsFormControl.value;
    if (
      this.ItemCodeFormControl.value == '' ||
      this.ItemUomCodeFormControl.value == ''
    ) {
      return;
    }
    let check1 = undefined;
    check1 = ItemFormControl.filter(
      (x) => x['item_id'] === this.ItemCodeFormControl.value
    );
    if (check1 !== undefined && check1.length > 0) {
      return;
    }

    let itemName = '';
    let itemUom = '';
    this.itemData.forEach((item, i) => {
      if (item.id == this.ItemCodeFormControl.value) {
        itemName = item.item_name;
      }
    });
    this.itemUomData.forEach((item, i) => {
      if (item.id == this.ItemUomCodeFormControl.value) {
        itemUom = item.name;
      }
    });
    const itemCode = {
      item_id: this.ItemCodeFormControl.value,
      item_name: itemName,
      item_uom_id: this.ItemUomCodeFormControl.value,
      item_uom_name: itemUom,
    };
    this.itemCodeList.push(itemCode);
    ItemFormControl.push(itemCode);
    this.itemsFormControl.setValue(ItemFormControl);
    //console.log(this.itemsFormControl.value);
    this.updateItemSource(ItemFormControl);
    this.overviewFormGroup.addControl('item_ids', this.itemsFormControl);

  }

  public updateExistingItemCode(index: number): void {
    let itemName = '';
    let itemUom = '';
    this.itemData.forEach((item, i) => {
      if (item.id == this.ItemCodeFormControl.value) {
        itemName = item.item_name;
      }
    });
    this.itemUomData.forEach((item, i) => {
      if (item.id == this.ItemUomCodeFormControl.value) {
        itemUom = item.name;
      }
    });
    let ItemFormControl = this.itemsFormControl.value;
    ItemFormControl.splice(index, 1, {
      item_id: this.ItemCodeFormControl.value,
      item_name: itemName,
      item_uom_id: this.ItemUomCodeFormControl.value,
      item_uom_name: itemUom,
    });
    this.updateItemCode = undefined;
    this.updateItemSource(ItemFormControl);
  }

  private updateItemSource(ItemFormControl): void {
    this.itemSource = new MatTableDataSource<any>(ItemFormControl);
    this.itemSource.paginator = this.paginator;
    this.ItemCodeFormControl.setValue('');
    this.ItemUomCodeFormControl.setValue('');
  }

  public hidePaginator(len: any): boolean {
    return len < 6 ? true : false;
  }
  setCustomersList() {
    var selectCustomer = [];
    this.editData.p_d_p_customers.forEach((customer) => {
      selectCustomer.push({
        id: customer.customer_info.user_id,
        itemName: customer.customer_info?.user?.firstname + ' ' + customer.customer_info?.user?.lastname + ' - ' + customer.customer_info.customer_code
      });
    });
    this.selectedCustomers.setValue(selectCustomer);
    this.onCustomerChange();
  }
}
