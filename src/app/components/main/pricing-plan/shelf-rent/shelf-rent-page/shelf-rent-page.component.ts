import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ShelfRentDtComponent } from '../shelf-rent-dt/shelf-rent-dt.component';

@Component({
  selector: 'app-shelf-rent-page',
  templateUrl: './shelf-rent-page.component.html',
  styleUrls: ['./shelf-rent-page.component.scss']
})
export class ShelfRentPageComponent extends BaseComponent implements OnInit {
  public isDetailVisible: boolean;
  public shelfRent: ShelfRentDtComponent;
  checkedRows = [];
  public newShelfRentData = {};
  private fds: FormDrawerService;
  constructor(fds: FormDrawerService, private router: Router, public apiService: ApiService, private route: ActivatedRoute,
    public cts: CommonToasterService,
    private deleteDialog: MatDialog,) {
    super('Shelf Rent');
  }

  ngOnInit(): void {
  }
  openAddShelfRent() {
    this.router.navigate(['./add'], { relativeTo: this.route });
  }

  public itemClicked(data: any): void {
    this.getCustomerLobList(data);
    if (data) {
      this.isDetailVisible = true;
      this.shelfRent = data;
    }
  }
  getCustomerLobList(data) {
    this.apiService.getLobsByCustomerId(data?.user_id).subscribe((result) => {
      let customerLobList = result.data[0] && result.data[0]?.customerlob || [];
      let lob = customerLobList.find((x) => x.lob_id == data.lob_id);
      data.lob = lob.lob
    })
  }
  selectedRows(data: any) {
    this.checkedRows = data;
  }
  public closeClicked(): void {
    this.isDetailVisible = false;
  }

  updateTableData(data) {
    this.newShelfRentData = data;
  }

  public bulkAction(action): void {
    let phrase = action == 'active' || action == "inactive" ? "mark as " + action : action;
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to ${phrase} selected Records `,
          btnText: phrase
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data?.hasConfirmed) {
          this.applyAulkAction(action);
        }
      });
  }

  applyAulkAction(action) {
    let ids = [];
    this.checkedRows.forEach(element => {
      ids.push(element.uuid);
    });
    let body = {
      module: 'PriceDiscoPromoPlan',
      action: action,
      ids: ids
    };
    this.apiService.bulkAction(body).subscribe(
      (res) => {
        if (res.status == true) {
          this.checkedRows = [];
          this.cts.showSuccess('Success', 'Action Successfull');
          this.updateTableData(body);
        } else {
          this.cts.showError('Error', 'Action Un-successfull');
        }
      },
      (error) => {
        this.cts.showError('Error', 'Action Un-successfull');
      }
    )
  }

}
