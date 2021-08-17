import { filter } from 'rxjs/operators';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ApiService } from 'src/app/services/api.service';
import { AdvanceSearchService } from './services/advance-serach.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';

@Component({
  selector: 'app-advance-search-form',
  templateUrl: './advance-search-form.component.html',
  styleUrls: ['./advance-search-form.component.scss'],
})
export class AdvanceSearchFormComponent implements OnInit {
  @ViewChild('activeComponent') childComponent: any;
  masterData: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: AdvanceSearchService,
    public dialogRef: MatDialogRef<AdvanceSearchFormComponent>,
    private apiService: ApiService,
    private eventService: EventBusService
  ) { }

  ngOnInit(): void {
    this.getData();
  }
  getData() {
    this.service.getCustomerMasterData().subscribe(
      (response) => {
        this.masterData = response.data;
      },
      (response) => { }
    );
  }
  clean(model) {
    for (var propName in model) {
      if (model[propName] === null || model[propName] === undefined || propName === 'module' || propName === "page" || propName === "page_size") {
        delete model[propName];
      }
    }
    return model
  }
  search(isReset) {
    const model = this.childComponent.form.value;
    module['allData'] = isReset;
    let request = this.clean({ ...model });
    request = this.filterObjectValues(request);
    request = this.snakeToCamelObject(request);
    model.page = 1;
    model.page_size = 10;
    this.apiService.onSearch(model).subscribe((response) => {
      this.eventService.emit(new EmitEvent(model.module, {
        request: request,
        requestOriginal: model,
        response: response
      }));
      this.dialogRef.close();
    });
  }
  snakeToCamelObject = (data) => {
    let mapped = {};
    Object.keys(data).forEach((key, index) => {
      let converted = key.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      converted = this.camelToSentenceCase(converted)
      mapped[converted] = data[key];
    });
    return mapped;
  };
  camelToSentenceCase = (text) => {
    const result = text.replace(/([A-Z])/g, ' $1');
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  };
  filterObjectValues(model) {
    for (var propName in model) {
      let filterdata;
      switch (propName) {
        case "customer":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.customers.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.firstname + ' ' + filterdata.lastname;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.customers.filter((x) => x.id == element);
              names += filterdata[0].firstname + ' ' + filterdata[0].lastname + ', ';
            });
            model[propName] = names;
          }
          break;
        case "salesman":
          filterdata = this.masterData.salesmans.filter((x) => x.id == model[propName])[0];
          model[propName] = filterdata.firstname + ' ' + filterdata.lastname;
          break;
        case "channel":
          filterdata = this.masterData.channel.filter((x) => x.id == model[propName]);
          if (filterdata.length > 0) {
            model[propName] = filterdata[0].name;
          } else {
            let subfilterdata = this.masterData.channel.filter((x) => x.children.some((y) => y.id == model[propName]));
            if (subfilterdata.length > 0) {
              model[propName] = subfilterdata[0].children[0].name;
            }
          }
          break;
        case "sales_organisation":
          filterdata = this.masterData.sales_organisation.filter((x) => x.id == model[propName]);
          if (filterdata.length > 0) {
            model[propName] = filterdata[0].name;
          } else {
            let subfilterdata = this.masterData.sales_organisation.filter((x) => x.children.some((y) => y.id == model[propName]));
            if (subfilterdata.length > 0) {
              model[propName] = subfilterdata[0].children[0].name;
            }
          }
          break;
        case "region":
          filterdata = this.masterData.region.filter((x) => x.id == model[propName])[0];
          model[propName] = filterdata.region_name;
          break;
        case "route":
          filterdata = this.masterData.route.filter((x) => x.id == model[propName])[0];
          model[propName] = filterdata.route_name;
          break;
        case "merchandiser":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.merchandiser.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.user.firstname + ' ' + filterdata.user.lastname;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.merchandiser.filter((x) => x.user.id == element);
              names += filterdata[0].user.firstname + ' ' + filterdata[0].user.lastname + ', ';
            });
            model[propName] = names;
          }
          break;
        case "category":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.item_major_category_list.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.name;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.item_major_category_list.filter((x) => x.id == element);
              names += filterdata[0].name + ', ';
            });
            model[propName] = names;
          }
          break;
        case "item_major_category_id":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.item_major_category_list.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.name;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.item_major_category_list.filter((x) => x.id == element);
              names += filterdata[0].name + ', ';
            });
            model[propName] = names;
          }
          break;
        case "brand":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.brand_list.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.brand_name;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.brand_list.filter((x) => x.id == element);
              names += filterdata[0].brand_name + ', ';
            });
            model[propName] = names;
          }
          break;
        case "brand_id":
          if (typeof model[propName] == 'number') {
            filterdata = this.masterData.brand_list.filter((x) => x.id == model[propName])[0];
            model[propName] = filterdata.brand_name;
          } else {
            let names = '';
            model[propName].forEach(element => {
              filterdata = this.masterData.brand_list.filter((x) => x.id == element);
              names += filterdata[0].brand_name + ', ';
            });
            model[propName] = names;
          }
          break;
        default:
          break;
      }
    }
    //console.log(model);
    return model;
  }
}
