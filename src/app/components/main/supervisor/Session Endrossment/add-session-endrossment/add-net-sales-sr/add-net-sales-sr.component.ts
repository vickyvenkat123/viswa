import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-net-sales-sr',
  templateUrl: './add-net-sales-sr.component.html',
  styleUrls: ['./add-net-sales-sr.component.scss']
})
export class AddNetSalesSRComponent implements OnInit {
  displayedColumns: string[] = ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5', 'Cat6', 'Cat7',
    'Cat8', 'Cat9', 'Cat10', 'Cat11', 'Others', 'Total']
  ELEMENT_DATA: any = [
    {
      Cat1: "-93", Cat2: "576", Cat3: "66", Cat4: "01", Cat5: "55", Cat6: "65"
      , Cat7: "67", Cat8: "04", Cat9: "099", Cat10: "0", Cat11: "0", Others: "51", Total: "51"
    }

  ];
  constructor() { }

  ngOnInit(): void {
  }

}
