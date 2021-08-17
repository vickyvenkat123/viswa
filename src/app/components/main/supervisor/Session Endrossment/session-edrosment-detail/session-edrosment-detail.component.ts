import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-edrosment-detail',
  templateUrl: './session-edrosment-detail.component.html',
  styleUrls: ['./session-edrosment-detail.component.scss']
})
export class SessionEdrosmentDetailComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public Session: any;
  @Input() public isDetailVisible: boolean;
  constructor(private route: Router,) { }
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
  ngOnInit(): void {
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.detailsClosed.emit();
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
