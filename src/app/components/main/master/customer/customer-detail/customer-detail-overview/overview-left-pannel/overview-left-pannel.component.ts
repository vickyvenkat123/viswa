import { Component, OnInit, Input } from '@angular/core';
import { Customer } from '../../../customer-dt/customer-dt.component';

@Component({
  selector: 'app-overview-left-pannel',
  templateUrl: './overview-left-pannel.component.html',
  styleUrls: ['./overview-left-pannel.component.scss'],
})
export class OverviewLeftPannelComponent implements OnInit {
  public domain = window.location.host.split('.')[0];
  public showCollapsedAttr = true;
  public showCollapsedAddr = true;
  public showCollapsedPartner = true;
  constructor() { }
  @Input() public customer: any;
  @Input() public lobInfo: any;
  _RETURN = 'Return';
  _CREDITNOTE = 'Credit Limit';
  _SALES = 'Sales';
  _BLANKBLOACK = '';
  ngOnInit(): void {
    //console.log(this.customer);
  }
  getDocString(string) {
    var str = string.split("/");
    return str[str.length - 1];
  }
  downloadFile(doc) {
    var url = doc.doc_string;
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', `${url}`);
    link.setAttribute('download', `${url}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  getDueOn(val) {
    if (val == '2') {
      return 'Customer Statement';
    } else {
      return 'Invoice Date';
    }
  }

  checkBlockValue(value) {
    if (this.lobInfo?.customer_block_types)
      return this.lobInfo?.customer_block_types.find(x => x.type == value)?.is_block == 1 || false;
    else {
      return false;
    }
  }


  checkLOBBlockValue(value) {
    if (this.customer?.customer_block_types)
      return this.customer?.customer_block_types.find(x => x.type == value)?.is_block == 1 || false;
    else {
      return false;
    }
  }

}
