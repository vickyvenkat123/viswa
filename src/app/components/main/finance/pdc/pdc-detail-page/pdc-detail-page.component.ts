import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { DeleteConfirmModalComponent } from 'src/app/components/shared/delete-confirmation-modal/delete-confirmation-modal.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';
import { ApiService } from 'src/app/services/api.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';
import { CompDataServiceType } from 'src/app/services/constants';
import { DataEditor } from 'src/app/services/data-editor.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { PdcPdfMakerService } from '../../pdc/pdc-pdf-maker.service';
import { CashierReceiptService } from '../../cashier-receipt/cashier-receipt.service';
import { Cashier } from '../pdc-master/pdc-master.component';

@Component({
  selector: 'app-pdc-detail-page',
  templateUrl: './pdc-detail-page.component.html',
  styleUrls: ['./pdc-detail-page.component.scss']
})
export class PdcDetailPageComponent extends BaseComponent implements OnInit {
  @Output() public detailsClosed: EventEmitter<any> = new EventEmitter<any>();
  @Input() public cashier: Cashier | any;
  @Input() public isDetailVisible: boolean;
  public showSpinner: boolean = false;
  public isEdit: boolean = false;
  public color: ThemePalette = 'primary';
  public mode: ProgressSpinnerMode = 'determinate';

  private dataService: DataEditor;
  private formDrawer: FormDrawerService;
  private deleteDialog: MatDialog;
  private apiService: ApiService;
  private bankList = [];
  public collectionData = [];
  public collectionDetails = [];
  page = 1;
  pageSize = 5;
  paginateData: any = [];

  constructor(
    apiService: ApiService,
    deleteDialog: MatDialog,
    dataService: DataEditor,
    private cashierReceiptPdfMakerService: PdcPdfMakerService,
    formDrawer: FormDrawerService,
    private ctc: CommonToasterService,
    private cash: CashierReceiptService,
    private router: Router
  ) {
    super('Cashier Receipt');
    this.getBank();
    Object.assign(this, { apiService, deleteDialog, dataService, formDrawer });
  }

  ngOnInit(): void {
    this.dataService.newData.subscribe((res: any) => {
      if (res) {
        this.isDetailVisible = true;
        this.cashier = res;
        if (res['type'] != CompDataServiceType.CLOSE_DETAIL_PAGE) {
          this.getallCollection();
        }
      }
    });

  }
  getallCollection() {
    var data = {
      "salesman_id": this.cashier.salesman_id,
      "payment_type": "2",
      "date": this.cashier.date
    }
    this.getCollectionList(data);
  }
  getCollectionList(data) {
    this.apiService.getColleactionList(data).subscribe((res: any) => {
      console.log('Result', res);
      this.collectionData = res.data;
      this.getCollectionDetails();
    })
  }
  editPDC() {
    this.isEdit = true;
  }
  cancelEdit() {
    this.isEdit = false;
  }
  getCollectionDetails() {
    this.collectionDetails = [];
    this.collectionData.forEach(element => {
      if (element.collectiondetails.length) {
        element.collectiondetails.forEach(element1 => {
          element1.collection_number = element.collection_number;
          element1.created_at = element.created_at;
          element1.customer = element.customer;
          this.collectionDetails.push(element1);
        });
      }
    });
    this.getPremiumData();
    this.cashier.collectionDetails = this.collectionDetails;
    this.cashier.collectionDetails.forEach(item => {
      if (item?.type == 0 || item?.type == 1) {
        item.type_name = 'Invoice';
        item.invoice_number = item?.invoice?.invoice_number;
        item.grand_total = item?.invoice?.grand_total;
      } else if (item?.type == 2) {
        item.type_name = 'Debit Note';
        item.invoice_number = item?.debit_note?.debit_note_number;
        item.grand_total = item?.debit_note?.grand_total;
      } else if (item?.type == 3) {
        item.type_name = 'Credit Note';
        item.invoice_number = item?.credit_note?.credit_note_number;
        item.grand_total = item?.credit_note?.grand_total
      }
    });
    this.cashier.bank = this.getBankName(this.cashier?.bank_id);
  }
  getPremiumData() {
    this.paginateData = this.collectionDetails.filter(x => x.type == 1)
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }
  onPageFired(data) {
    this.page = data['pageIndex'] + 1;
    this.pageSize = data['pageSize'];
    this.getPremiumData();
  }
  getBank() {
    this.cash.getBankDetails().subscribe((res: any) => {
      if (res.status) {
        this.bankList = res.data;
      }
    });
  }
  public closeDetailView(): void {
    this.isDetailVisible = false;
    this.isEdit = false;
    this.detailsClosed.emit(false);
    this.dataService.sendData({ type: CompDataServiceType.CLOSE_DETAIL_PAGE });
    this.router.navigate(['finance/pdc']);
  }

  public openEditCustomer(): void {
    // this.dataService.sendData({ type: CompDataServiceType.DATA_EDIT_FORM, data: this.cashier });
    // this.formDrawer.setFormName('customer');
    // this.formDrawer.setFormType('Edit');
    // this.formDrawer.open();
  }
  public toggleStatus(): void {
    this.cashier.cashier = this.cashier.status === 0 ? 1 : 0;
  }
  public openDeleteBox(): void {
    this.deleteDialog
      .open(DeleteConfirmModalComponent, {
        width: '500px',
        data: {
          title: `Are you sure want to delete ${this.cashier.cashier_reciept_number}?`,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data.hasConfirmed) {
          this.deleteOder();
        }
      });
  }

  private deleteOder(): void {
    this.cash.deleteCashierReceipt(this.cashier.uuid).subscribe((result) => {
      this.ctc.showSuccess('', 'Deleted Successfully!Please check the table');
      this.router.navigate(['finance/cashier-reciept']);
    });
  }
  getBankName(val) {
    let bank = this.bankList.find((x) => x.id == val);
    return bank?.bank_name || '';
  }
  getDocument() {
    this.cashierReceiptPdfMakerService.cashier = this.cashier;
    this.cashierReceiptPdfMakerService.generatePDF()
  }
}
