import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cancel-modal',
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrls: ['./delete-confirmation-modal.component.scss']
})
export class DeleteConfirmModalComponent {

  public matDialogRef: MatDialogRef<DeleteConfirmModalComponent>;
  public customData: {
    title: string;
    btnText: string;
    description: string;
    hasConfirmed: boolean;
  };

  constructor(matDialogRef: MatDialogRef<DeleteConfirmModalComponent>, @Inject(MAT_DIALOG_DATA) customData: any) {
    Object.assign(this, { matDialogRef, customData });
  }

  public cancel(): void {
    this.matDialogRef.close();
  }

  public confirm(): void {
    this.customData.hasConfirmed = true;
    this.matDialogRef.close(this.customData);
  }
}
