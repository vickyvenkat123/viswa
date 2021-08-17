import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-import',
  templateUrl: './order-import.component.html',
  styleUrls: ['./order-import.component.scss']
})
export class OrderImportComponent implements OnInit {

  public data: any = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
  }


  backToOrder() {
    this.router.navigate(['transaction/order']).then();
  }

  public selectedFile(data: any): void {
    this.data = data;
    //console.log(this.data);
  }



}
