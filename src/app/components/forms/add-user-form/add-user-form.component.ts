import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataEditor } from 'src/app/services/data-editor.service';

@Component({
  selector: 'app-add-user-form',
  templateUrl: './add-user-form.component.html',
  styleUrls: ['./add-user-form.component.scss']
})
export class AddUserFormComponent implements OnInit {
  roles;
  isEdit: boolean;
  userData: any;
  parentCustomers: any[] = [];
  constructor(private apiService: ApiService, private fds: FormDrawerService, private dataEditor: DataEditor) { }
  inviteUserFormGroup: FormGroup;
  isSubmitted: boolean = false;

  ngOnInit(): void {
    this.apiService.getAllOrganisationRoles().subscribe(data => {
      this.roles = data.data;
      //console.log(this.roles);
    })


    this.fds.formType.subscribe(res => {
      if (res == "Edit") {
        this.isEdit = true;
      }
      else {
        this.isEdit = false;
      }
    })
    this.dataEditor.newData.subscribe(result => {
      const data: any = result.data;
      //console.log(data);
      if (data && data.uuid) {
        if (data?.firstname) {
          this.firstname.setValue(data?.firstname);
        } else {
          this.firstname.setValue(data?.user?.firstname);
        }

        if (data?.lastname) {
          this.lastname.setValue(data?.lastname);
        } else {
          this.lastname.setValue(data?.user?.lastname);
        }

        if (data?.email) {
          this.email.setValue(data?.email);
        } else {
          this.email.setValue(data?.user?.email);
        }

        if (data?.mobile) {
          this.mobile.setValue(data?.mobile);
        } else {
          this.mobile.setValue(data?.user?.mobile);
        }

        this.role_id.setValue(data?.role_id);
        this.parent_id.setValue(data?.parent_id);
        this.email.disable;
        this.userData = data;
        this.isEdit = true;
      }
      return;
    });
    this.inviteUserFormGroup = new FormGroup({
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      mobile: new FormControl('', Validators.required),
      role_id: new FormControl('', Validators.required),
      parent_id: new FormControl(''),
      status: new FormControl(1)
    });

    this.inviteUserFormGroup.get('role_id').valueChanges.subscribe(res => {
      this.apiService.getAllOrganisationParentCutomer(res).subscribe(data => {
        this.parentCustomers = data.data;
        //console.log(this.roles);
      })
    });
  }
  get firstname() {
    return this.inviteUserFormGroup.get('firstname') as FormControl;
  }
  get lastname() {
    return this.inviteUserFormGroup.get('lastname') as FormControl;
  }
  get email() {
    return this.inviteUserFormGroup.get('email') as FormControl;
  }
  get mobile() {
    return this.inviteUserFormGroup.get('mobile') as FormControl;
  }
  get role_id() {
    return this.inviteUserFormGroup.get('role_id') as FormControl;
  }
  get parent_id() {
    return this.inviteUserFormGroup.get('parent_id') as FormControl;
  }
  inviteUser() {
    this.firstname.markAsDirty;
    this.lastname.markAsDirty;
    this.email.markAsDirty;
    this.mobile.markAsDirty;
    this.role_id.markAsDirty;
    this.isSubmitted = true;
    if (this.inviteUserFormGroup.valid) {
      if (this.isEdit) {
        let requestPayload = {
          firstname: this.inviteUserFormGroup.value.firstname,
          lastname: this.inviteUserFormGroup.value.lastname,
          mobile: this.inviteUserFormGroup.value.mobile,
          role_id: this.inviteUserFormGroup.value.role_id,
          parent_id: this.inviteUserFormGroup.value.parent_id,
          status: 1
        }
        this.apiService.updateInviteUser(this.userData.uuid, requestPayload).subscribe((res) => {
          this.close();
        })
      }
      else {
        this.apiService.inviteUser(this.inviteUserFormGroup.value).subscribe((res) => {
          //console.log(res);
          this.close();
        })
      }
    }
    else {

    }

  }
  close() {
    this.inviteUserFormGroup.reset();
    this.fds.close();
    this.fds.setFormType('user');

  }

}
