import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-promotion-form-slab-table',
  templateUrl: './promotion-form-slab-table.component.html',
  styleUrls: ['./promotion-form-slab-table.component.scss'],
})
export class PromotionFormSlabTableComponent implements OnInit, OnChanges {
  @Input() overviewFormGroup: FormGroup;
  @Input() editData: any;
  data: SlabData[] = [{ from_qty: '', to_qty: '', item_uom_id: '', offer_qty: '' }];
  uomArray: any[];
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  displayColumns = ['from_qty', 'to_qty', 'item_uom_id', 'offer_qty', 'action'];
  rows: FormArray = this.fb.array([]);
  promotionSlabFormGroup: FormGroup = this.fb.group({
    orderItemFormArray: this.rows,
  });




  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit() {
    this.data.forEach((d: SlabData) => this.addRow());
    this.updateView();
    this.apiService.getAllItemUoms().subscribe((uoms) => {
      this.uomArray = uoms.data;
    });
  }
  ngOnChanges() {

    this.overviewFormGroup.addControl('slab', this.promotionSlabFormGroup)
    if (this.editData) {
      this.editData.forEach(slab => {
        let row = this.fb.group({
          from_qty: [slab.from_qty],
          to_qty: [slab.to_qty],
          item_uom_id: [slab.item_uom_id],
          offer_qty: [slab.offer_qty]
        });
        this.rows.push(row);
      })
      setTimeout(() => {
        this.rows.removeAt(this.rows.length - 1);
        this.updateView();
      }, 10);

    }
  }

  emptyTable() {
    while (this.rows.length !== 0) {
      this.rows.removeAt(0);
    }
  }

  addRow() {
    if (this.rows.length > 0) {
      const row = this.fb.group({
        from_qty: [this.from_qty],
        to_qty: [''],
        item_uom_id: [''],
        offer_qty: [''],
      });
      this.rows.push(row);
    } else {
      const row = this.fb.group({
        from_qty: [''],
        to_qty: [''], //min value of mislab, bind with current input value
        item_uom_id: [''],
        offer_qty: [''],
      });
      this.rows.push(row);
    }
    this.updateView();
    this.overviewFormGroup.addControl('slab', this.rows);

  }
  addRowInvalid(): boolean {
    if (
      !this.promotionSlabFormGroup.valid ||
      this.initialfrom_qty > this.initialto_qty ||
      this.to_qty > this.from_qty ||
      this.to_qty == ''
    ) {
      return true;
    } else {
      return false;
    }
  }
  deleteRowInvalid(): boolean {
    if (this.rows.length <= 1) {
      return true;
    }
    else {
      return false;
    }
  }
  deleteItem(index) {
    this.rows.removeAt(index);
    this.updateView();
    this.overviewFormGroup.addControl('slab', this.rows);

  }
  updateView() {
    this.dataSource.next(this.rows.controls);
  }
  isFirstRow(index) {
    if (index === 0) {
      return true;
    } else {
      return false;
    }
  }

  get initialfrom_qty() {
    return this.promotionSlabFormGroup.get('orderItemFormArray').value[0]
      .from_qty;
  }
  get initialto_qty() {
    return this.promotionSlabFormGroup.get('orderItemFormArray').value[0]
      .to_qty;
  }
  get from_qty() {
    return (
      this.promotionSlabFormGroup.get('orderItemFormArray').value[
        this.rows.length - 1
      ].to_qty
    );
  }
  get to_qty() {
    return this.promotionSlabFormGroup.get('orderItemFormArray').value[
      this.rows.length - 1
    ].to_qty;
  }
}

export interface SlabData {
  from_qty: string;
  to_qty: string;
  item_uom_id: string;
  offer_qty: string;
}
