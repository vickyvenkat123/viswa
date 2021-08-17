import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FormDrawerService } from './services/form-drawer.service';
import { MatDrawer } from '@angular/material/sidenav';
import { slideInAnimation } from './route-animation';
import {
  RouterOutlet,
  Router,
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
} from '@angular/router';
import { CommonSpinnerService } from './components/shared/common-spinner/common-spinner.service';
import { registerLocaleData } from '@angular/common';
import { setCurrency } from './services/constants';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'SFA-SAAS';
  formName = '';
  isCashierReceiptReload: boolean = false;
  @ViewChild('formDrawer') fromDrawer: MatDrawer;
  constructor(
    private fds: FormDrawerService,
    private router: Router,
    private commonSpinnerService: CommonSpinnerService,
    public apiService: ApiService
  ) {
    this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.commonSpinnerService.show();
          break;
        }
        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.commonSpinnerService.hide();
          break;
        }
      }
    });
  }
  ngOnInit() {
    const themeName = localStorage.getItem('selected-theme');
    let currency = localStorage.getItem('currency');
    if (currency && currency !== 'null') {
      currency = JSON.parse(currency);
      setCurrency(currency['code']);
    }
    document.documentElement.setAttribute('data-theme', themeName);
    this.fds.formName.subscribe((x) => (this.formName = x));

    if (localStorage.getItem('isLoggedIn') == 'true') {
      this.getPermissions();
    }
  }

  getPermissions() {
    this.apiService.getLoggedInPermissions().subscribe((res) => {
      // console.log(res);
      localStorage.setItem(
        'permissions',
        JSON.stringify(res)
      );
    })
  }

  ngAfterViewInit(): void {
    this.fds.setNavDrawer(this.fromDrawer);
  }
  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }
  isLoggedIn(): boolean {
    if (localStorage.getItem('isLoggedIn') == 'true') {
      return true;
    } else {
      return false;
    }
  }

  isSideBar(): boolean {
    if (JSON.parse(localStorage.getItem('sidebar')) == null) {
      return false;
    } else {
      return true;
    }
  }
}
