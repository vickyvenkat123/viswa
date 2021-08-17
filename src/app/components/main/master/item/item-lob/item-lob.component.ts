import { Component, OnInit } from '@angular/core';
  import { FormControl, FormGroup, Validators } from '@angular/forms';
  import { ApiService } from 'src/app/services/api.service';
  import { CommonToasterService } from 'src/app/services/common-toaster.service';
  import { Lob } from '../../../settings/customer/credit-limits/credit';
  import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-item-lob',
  templateUrl: './item-lob.component.html',
  styleUrls: ['./item-lob.component.scss']
})
export class ItemLobComponent implements OnInit {

    addLobForm : FormGroup;
  
  
    lobList: Lob[] =[];
  
    public lob: Lob;
  
    private dialogRef: MatDialogRef<ItemLobComponent>;
    public showForm: boolean;
    public name: FormControl;
  
    
    constructor(private apiService: ApiService,
      private cts: CommonToasterService,
      public dialog: MatDialog,
      dialogRef: MatDialogRef<ItemLobComponent> ) { }
  
    ngOnInit(): void {
  
      this.addLobForm = new FormGroup({
        name: new FormControl('', Validators.required),
      });
      
      this.getLob();
    }
   
  
   
  
    
  
    addLob(){
        this.apiService.addLob(this.addLobForm.value).subscribe(response => {
          console.log("LOB", response);
        this.cts.showSuccess("", "LOB Saved Successfully");
        this.addLobForm.reset();
        this.getLob();
        });
        this.getLob();
        this.showForm = false;
    }
  
    addNewCustomerCategory() {
      this.showForm = true;
      this.reset();
    }
  
    reset() {
  
      this.name.patchValue('');
    }
  
    getLob(){
      
      this.apiService.getLobs().subscribe(lobs => {
        console.log("resonseLobs", lobs.data);
         this.lobList = lobs.data;
      })
      
    }
     
  
    // public delete(data: any): void {
    //   this.subscriptions.push(
    //     this.apiService.deleteCustomerCategory(data.uuid).subscribe(() => {
    //       this.getCategory();
    //     })
    //   );
    // }
  
    public delete(data: any): void{
      this.apiService.deleteLob(data.uuid).subscribe(res => {
        console.log("delete", res.data.uuid);
        this.cts.showInfo(
                'Deleted',
                'Sucessfully Deleted Lob'
              );
              this.getLob();
      })
      this.getLob();
    }
  
    public applySalesOrganisation(data: any): void {
      this.dialogRef.close(data);
    }
  
  }
  