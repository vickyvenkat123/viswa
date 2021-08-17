import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit {
  dashboardIndex: 0;
  navLinks: any[];
  activeLinkIndex = 1;
  domain = window.location.host.split('.')[0];
  constructor(private router: Router) { }
  ngOnInit(): void {
    this.navLinks = [
      {
        label: 'Dashboard 1',
        link: './board1',
        index: 0
      },
      {
        label: 'Dashboard 2',
        link: './board2',
        index: 1
      },
      {
        label: 'Dashboard 3',
        link: './board3',
        index: 2
      },
      {
        label: 'Dashboard 4',
        link: './board4',
        index: 3
      },
      {
        label: 'Dashboard 5',
        link: './board5',
        index: 4
      },
      {
        label: 'Dashboard 6',
        link: './board6',
        index: 5
      },
      {
        label: 'Dashboard 7',
        link: './board7',
        index: 6
      },
      {
        label: 'Dashboard 8',
        link: './board8',
        index: 7
      },
      {
        label: 'Dashboard 9',
        link: './board9',
        index: 8
      },
      {
        label: 'Dashboard 10',
        link: './board10',
        index: 9
      },
      {
        label: 'Dashboard 11',
        link: './board11',
        index: 10
      },
      {
        label: 'Dashboard 12',
        link: './board12',
        index: 11
      }
    ];

    if (this.domain == 'vansales') {
      this.navLinks.splice(1, 3);
    }

    // if (this.domain !== 'nfpc') {
    //   this.navLinks.push({
    //     label: 'Dashboard 5',
    //     link: './board5',
    //     index: 4
    //   })
    // }
    this.router.events.subscribe((res) => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
    });
  }
  tabChanged(item) {
    this.dashboardIndex = item.index;
  }

  checkPermission(value) {
    if (value == "Dashboard 1") {
      return false;
    }
    let data: any = localStorage.getItem('permissions');
    let userPermissions = [];
    if (!data) return true;
    data = JSON.parse(data);
    let module = data.find((x) => x.moduleName === value);
    if (!module) {
      userPermissions = [];
      return true;
    }
    userPermissions = module.permissions.map((permission) => {
      const name = permission.name.split('-').pop();
      return { name };
    });
    const isView = userPermissions.find((x) => x.name == 'list');
    return isView ? false : true;
  }
}
