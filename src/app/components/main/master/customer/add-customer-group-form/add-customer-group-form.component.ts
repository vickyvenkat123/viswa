import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CodeDialogComponent } from 'src/app/components/dialogs/code-dialog/code-dialog.component';
import { BaseComponent } from 'src/app/features/shared/base/base.component';

@Component({
  selector: 'app-add-customer-group-form',
  templateUrl: './add-customer-group-form.component.html',
  styleUrls: ['./add-customer-group-form.component.scss'],
})

export class AddCustomerGroupComponent extends BaseComponent implements OnInit {
  @Output() public updateTableData: EventEmitter<any> = new EventEmitter<any>();
  public CustomerFormGroup: FormGroup;
  public CustomerGroupNameFormControl: FormControl;
  public CustomerGroupCodeFormControl: FormControl;
  nextCommingNumberofCustomerGroupCode: string = '';
  nextCommingNumberofCustomerGroupCodePrefix: string = '';
  public formType: string;
  private isEdit: boolean;
  private CustomerGroupData: any;
  private fds: FormDrawerService;
  private apiService: ApiService;
  private dataEditor: DataEditor;
  private subscriptions: Subscription[] = [];
  isCustomField = false;
  constructor(
    fds: FormDrawerService,
    apiService: ApiService,
    dataEditor: DataEditor,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<AddCustomerGroupComponent>
  ) {
    super('Customer groups');
    Object.assign(this, { fds, apiService, dataEditor });
  }

  public ngOnInit(): void {
    this.getCustomFieldStatus();
    this.fds.formType.subscribe((s) => {
      this.formType = s;
      this.CustomerFormGroup?.reset();
      if (this.formType != 'Edit') {
        this.getCustomerGroupCode();
        this.isEdit = false;
      } else {
        this.isEdit = true;
      }
      this.subscriptions.push(
        this.dataEditor.newData.subscribe((result) => {
          const data: any = result.data;
          if (data && data.uuid && this.isEdit) {
            this.CustomerGroupNameFormControl.setValue(data.name);
            this.CustomerGroupCodeFormControl.setValue(data.code);
            this.CustomerGroupCodeFormControl.disable();
            // this.subCategoryIdFormControl.setValue(data.Customer_sub_category.name);
            this.CustomerGroupData = data;
            this.isEdit = true;
          }
        })
      );
    });
    this.CustomerGroupNameFormControl = new FormControl('', [Validators.required]);
    this.CustomerGroupCodeFormControl = new FormControl('', [Validators.required]);
    this.CustomerFormGroup = new FormGroup({
      CustomerGroupName: this.CustomerGroupNameFormControl,
      CustomerGroupCode: this.CustomerGroupCodeFormControl,
    });
    this.CustomerGroupCodeFormControl.disable();
  }
  getCustomFieldStatus() {
    this.apiService
      .checkCustomFieldStatus({
        organisation_id: 1,
        module_id: 6,
      })
      .subscribe((response) => {
        this.isCustomField =
          response.data.custom_field_status == 0 ? false : true;
      });
  }
  getCustomerGroupCode() {
    let nextNumber = {
      function_for: 'Customer_group',
    };
    this.apiService.getNextCommingCode(nextNumber).subscribe((res: any) => {
      if (res.status) {
        this.nextCommingNumberofCustomerGroupCode = res.data.number_is;
        this.nextCommingNumberofCustomerGroupCodePrefix = res.data.prefix_is;

        if (this.nextCommingNumberofCustomerGroupCode) {
          this.CustomerGroupCodeFormControl.setValue(
            this.nextCommingNumberofCustomerGroupCode
          );
          this.CustomerGroupCodeFormControl.disable();
        } else if (this.nextCommingNumberofCustomerGroupCode == null) {
          this.nextCommingNumberofCustomerGroupCode = '';
          this.CustomerGroupCodeFormControl.enable();
        }
      } else {
        this.nextCommingNumberofCustomerGroupCode = '';
        this.CustomerGroupCodeFormControl.enable();
      }
      //console.log('Res : ', res);
    });
  }
  public close() {
    this.dialogRef.close();
  }

  public saveCustomerData(): void {
    if (this.CustomerFormGroup.invalid) {
      return;
    }
    if (this.isEdit) {
      this.editCustomerGroupData();
    } else {
      this.postCustomerGroupData();
    }
  }

  public ngOnDestroy(): void {
    Utils.unsubscribeAll(this.subscriptions);
  }

  private postCustomerGroupData(): void {
    this.apiService
      .addCustomerGroup({
        group_code: this.CustomerGroupCodeFormControl.value,
        // "Customer_sub_category.name" : this.subCategoryIdFormControl.value,
        group_name: this.CustomerGroupNameFormControl.value,
        status: '1',
      })
      .subscribe((result: any) => {
        this.dialogRef.close(result.data);
      });
  }

  private editCustomerGroupData(): void {
    this.apiService
      .editCustomerGroup(this.CustomerGroupData.uuid, {
        group_code: this.CustomerGroupCodeFormControl.value,
        // "Customer_sub_category.name" : this.subCategoryIdFormControl.value,
        group_name: this.CustomerGroupNameFormControl.value,
        status: '1',
      })
      .subscribe((result: any) => {
        this.isEdit = false;
        let data = result.data;
        data.edit = true;
        this.updateTableData.emit(data);
        this.fds.close();
      });
  }
  restrictLength(e) {
    if (e.target.value.length >= 10) {
      e.preventDefault();
    }
  }

  open() {
    let response: any;
    let data = {
      title: 'Customer group Code',
      functionFor: 'Customer_group',
      code: this.nextCommingNumberofCustomerGroupCode,
      prefix: this.nextCommingNumberofCustomerGroupCodePrefix,
      key: this.nextCommingNumberofCustomerGroupCode.length
        ? 'autogenerate'
        : 'manual',
    };
    this.dialog
      .open(CodeDialogComponent, {
        width: '500px',
        height: '340px',
        data: data,
      })
      .componentInstance.sendResponse.subscribe((res: any) => {
        response = res;
        if (res.type == 'manual' && res.enableButton) {
          this.CustomerGroupCodeFormControl.setValue('');
          this.nextCommingNumberofCustomerGroupCode = '';
          this.CustomerGroupCodeFormControl.enable();
        } else if (res.type == 'autogenerate' && !res.enableButton) {
          this.CustomerGroupCodeFormControl.setValue(
            res.data.next_coming_number_Customer_group
          );
          this.nextCommingNumberofCustomerGroupCode =
            res.data.next_coming_number_Customer_group;
          this.nextCommingNumberofCustomerGroupCodePrefix = res.reqData.prefix_code;
          this.CustomerGroupCodeFormControl.disable();
        }
      });
  }
}
