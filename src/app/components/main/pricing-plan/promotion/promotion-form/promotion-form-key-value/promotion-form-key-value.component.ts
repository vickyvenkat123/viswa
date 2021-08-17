import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ApiKeySelectionService } from 'src/app/services/api-key-selection.service';
import { Router } from '@angular/router';
import { Utils } from 'src/app/services/utils';
import { Subscription, Subject } from 'rxjs';

@Component({
  selector: 'app-promotion-form-key-value',
  templateUrl: './promotion-form-key-value.component.html',
  styleUrls: ['./promotion-form-key-value.component.scss'],
})
export class PromotionFormKeyValueComponent implements OnInit, OnChanges {
  @Input() public overviewFormGroup: FormGroup;
  @Input() public editData: any;
  @Input() public showFormError: boolean;

  countries = [];
  regions = [];
  areas = [];
  routes = [];
  salesOrganisations = [];
  channels = [];
  customerCategories = [];
  customers = [];
  majorCategories;
  itemGroups = [];
  items = [];
  flatAreaData = [];
  flatChannelData = [];
  flatSalesOrganisationData = [];
  flatCategoryData = [];
  keySequence: string[] = [];
  public lookup$: Subject<any> = new Subject();

  valuesArray: any[] = [];

  selectedCountries: FormControl;
  selectedRegions: FormControl;
  selectedAreas: FormControl;
  selectedRoutes: FormControl;
  selectedSalesOrganisations: FormControl;
  selectedChannels: FormControl;
  selectedCustomerCategories: FormControl;
  selectedCustomers: FormControl;
  selectedCategories: FormControl;
  selectedItemGroups: FormControl;
  selectedItems: any[] = [];
  public page = 1;

  public keySequenceFromControl: FormControl;

  public countryFormControl: FormControl;
  public regionFormControl: FormControl;
  public areaFormControl: FormControl;
  public routeFormControl: FormControl;
  public isLoading: boolean;

  public salesOrganisationFormControl: FormControl;
  public channelFormControl: FormControl;
  public customerCategoryFormControl: FormControl;
  public customerFormControl: FormControl;

  public majorCategoryFormControl: FormControl;
  public itemGroupFormControl: FormControl;
  public itemsFormControl: FormControl;

  private apiService: ApiService;
  private ks: ApiKeySelectionService;
  public total_pages = 0;
  private router: Router;
  private subscriptions: Subscription[] = [];
  customersCopy: any[] = [];

  constructor(
    apiService: ApiService,
    ks: ApiKeySelectionService,
    router: Router
  ) {
    Object.assign(this, { apiService, ks, router });
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
    this.updateCustomers();
    this.updateItems();

    this.keySequenceFromControl = new FormControl();
    this.countryFormControl = new FormControl([]);
    this.regionFormControl = new FormControl([]);
    this.areaFormControl = new FormControl([]);
    this.routeFormControl = new FormControl([]);
    this.salesOrganisationFormControl = new FormControl([]);
    this.channelFormControl = new FormControl([]);
    this.customerCategoryFormControl = new FormControl([]);
    this.customerFormControl = new FormControl([]);
    this.majorCategoryFormControl = new FormControl([]);
    this.itemGroupFormControl = new FormControl([]);
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
    this.buildForm();
  }
  public ngOnChanges(): void {
    if (this.editData) {
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
          // let customers: any[] = this.editData.p_d_p_customers;
          // let selectCustomer = [];
          // customers.forEach((customer) => {
          //   selectCustomer.push({
          //     id: customer.customer_id,
          //     itemName: customer.customer_info?.user?.firstname + ' ' + customer.customer_info?.user?.lastname
          //   })
          // });
          // console.log(selectCustomer);
          // console.log('this.customers', this.customers);

          // setTimeout(() => {
          //   // this.editData.p_d_p_customers.forEach((customer) => {
          //   //   var customerObj = this.customers.find(x => x.customer_info.id == customer.customer_id);
          //   //   if (customerObj) {
          //   //     selectCustomer.push(customerObj);
          //   //   }
          //   // });
          //   this.selectedCustomers.setValue(selectCustomer);
          //   this.onCustomerChange();
          // }, 1);

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
    this.overviewFormGroup.addControl('country', this.countryFormControl);
    this.overviewFormGroup.addControl('region', this.regionFormControl);
    this.overviewFormGroup.addControl('area', this.areaFormControl);
    this.overviewFormGroup.addControl('route', this.routeFormControl);
    this.overviewFormGroup.addControl(
      'salesOrganisation',
      this.salesOrganisationFormControl
    );
    this.overviewFormGroup.addControl('channel', this.channelFormControl);
    this.overviewFormGroup.addControl(
      'customerCategory',
      this.customerCategoryFormControl
    );
    this.overviewFormGroup.addControl('customer', this.customerFormControl);
    this.overviewFormGroup.addControl(
      'majorCategory',
      this.majorCategoryFormControl
    );
    this.overviewFormGroup.addControl('itemGroup', this.itemGroupFormControl);
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
    this.countryFormControl.setValue(selecteCountry);
    let index = this.keySequence.indexOf('country');
    this.valuesArray = this.valuesArray.slice(0, index);
    console.log(this.selectedCountries);
    let nextSelection = this.keySequence[
      this.keySequence.indexOf('country') + 1
    ];
    //console.log(this.valuesArray);
    if (nextSelection == 'regions') {
      let data = { country_id: this.countryFormControl.value, param: 'regions' };
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
      let data = { country_id: this.countryFormControl.value, param: 'area' };
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
      let data = { country_id: this.countryFormControl.value, param: 'routes' };

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
    this.regionFormControl.setValue(selecteRegion);
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

    this.areaFormControl.setValue(selecteArea);
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
    this.selectedChannels.value.forEach(element => {
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
        // this.subscriptions.push(
        //   this.apiService.getAllRoute().subscribe((result: any) => {
        //     this.routes = result.data;
        //   })
        // );
        this.subscriptions.push(
          this.apiService.getMasterDataLists().subscribe((result: any) => {
            this.routes = result.data.route;
            console.log(this.routes);
          }));
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
    // this.subscriptions.push(
    //   this.apiService.getCustomers().subscribe((result: any) => {
    //     this.customers = result.data;
    //   })
    // );
    this.subscriptions.push(

      this.apiService.getMasterDataListsByItem('customer').subscribe((result: any) => {
        // this.selectedCustomers.setValue([])
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
  }
  onScroll() {
    if (this.total_pages < this.page) return;
    this.isLoading = true;
    this.lookup$.next(this.page);
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
    );
    // this.subscriptions.push(
    //   this.apiService.getMasterDataLists().subscribe((result: any) => {
    //     this.items = result.data.items;
    //   }));
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
