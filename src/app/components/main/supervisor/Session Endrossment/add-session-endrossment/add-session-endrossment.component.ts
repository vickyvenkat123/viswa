import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-session-endrossment',
  templateUrl: './add-session-endrossment.component.html',
  styleUrls: ['./add-session-endrossment.component.scss']
})
export class AddSessionEndrossmentComponent implements OnInit {

  public SessionFormGroup: FormGroup;
  public dateFormControl: FormControl;
  public routeFormControl: FormControl;
  public salesmanFormControl: FormControl;
  public routeid;
  public storeRoute: any[] = [];
  public salesmanList: any[] = [];
  public subscription: Subscription[] = []
  public showStepper: boolean = false;
  links = [
    'INVOICE',
    'CALL',
    'FOC',
    'BYCHANNEL',
    'MISSED CALLS',
    'ITEM GROUP',
    'CARRY OVER',
    'PRE TRIP INSEPECTION',
    'ITEM WISE',
    'ROUTE TRANSFER',
    'PRE SALES ALLOCATION',
    'WASTAGE',
    'NET SALES SR',
    'TGT DAILY SALES',
    'ACHIEVEMENT %',
    'WASTAGE %',
    'MTD NET SALES',
    'MTD TARGET SALES',
    'MTD ACH %',
    'MTD WASTAGE %',
    'DISTRIBUTION EXCEPTION DAY',
    'DISTRIBUTION ACHIVEMENT',
    'MTD DISTRIBUTION EXCEPTION',
    'DIS. MTD ACHIVEMENT',
    'OVER SELLING',
    'BUY BACK',
    'UNDER SELLING',
    'VSO',
  ];
  activeLink = this.links[0];
  stepperhide: boolean = false;
  constructor(private apiService: ApiService, private commonToasterService: CommonToasterService, private router: Router) { }

  ngOnInit(): void {
    this.buildForm()
    this.subscription.push(this.apiService.getAllRoute().subscribe((res) => {
      this.storeRoute = res.data;
      //console.log(res);
    }))

  }

  public buildForm() {
    this.dateFormControl = new FormControl('', [Validators.required]);
    this.routeFormControl = new FormControl('', [Validators.required]);
    this.salesmanFormControl = new FormControl('', [Validators.required]);
    this.SessionFormGroup = new FormGroup({
      date: this.dateFormControl,
      route_id: this.routeFormControl,
      salesman_id: this.salesmanFormControl
    })

  }
  getSalesManList(ev) {
    this.getSalesman(ev.value);
    this.routeid = ev.value;
  }
  getSalesman(id: number) {
    this.apiService.getSalesmanByRoute(id).subscribe((res: any) => {
      if (res.status) {
        this.salesmanList = res.data;
      }
    });
  }
  submit() {
    console.log(this.SessionFormGroup.value);
    this.apiService.saveSessionEndrossment(this.SessionFormGroup.value).subscribe((res) => {
      this.commonToasterService.showSuccess(
        'Session Endrossment Saved',
        'Session Endrossment Saved successfully'
      );
      let data = res.data;
      data.edit = false;
      this.close();
    },
      (error) => {
        console.error(error.errors);
      })
  }
  checkChange(changeControl: FormControl) {
    //console.log(changeControl);
  }
  openStepper() {
    this.showStepper = true;
  }
  close() {
    this.showStepper = false;
    this.router.navigate(['supervisor/session']);
  }

  backTab() {
    var index = this.links.findIndex(x => x == this.activeLink);
    this.activeLink = this.links[--index];
  }
  nextTab() {
    var index = this.links.findIndex(x => x == this.activeLink);
    this.activeLink = this.links[++index];
  }
}
