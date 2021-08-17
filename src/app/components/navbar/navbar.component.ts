import { PAGE_SIZE_10 } from './../../app.constant';
import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { MatDialog } from '@angular/material/dialog';
import { AdvanceSearchFormComponent } from '../dialog-forms/advance-search-form/advance-search-form.component';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MatMenuTrigger, MatMenuPanel } from '@angular/material/menu';
import { SidenavService } from 'src/app/services/sidenav.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { EmitEvent, Events } from 'src/app/models/events.model';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  org_name: string;
  checkedOption = '';
  advanceSearchConfig = [];
  sidebar = [];
  private subscriptions: Subscription[] = [];
  notificationCount: number = 0;
  @ViewChild('clickMenuTrigger') menuTrigger: MatMenuTrigger;
  public avatarImage: string = 'https://secure.gravatar.com/avatar/1aedb8d9dc4751e229a335e371db8058?&amp;d=mm';
  constructor(
    private fds: FormDrawerService,
    private dialog: MatDialog,
    private router: Router,
    private eventService: EventBusService,
    private sidenavService: SidenavService,
    private apiService: ApiService,
    private auth: AuthService,
    private dataEditor: DataEditor
  ) { }

  login_track_activity = JSON.parse(localStorage.getItem('login_track_activity'));
  is_trial;
  domain = window.location.host.split('.')[0];
  ngOnInit(): void {
    this.subscriptions.push(
      this.eventService.on(Events.CHANGE_CRITERIA, ({ reset, module, route }) => {
        this.checkedOption = route;
        if (reset) {
          this.resetFilter({ module });
        } else
          this.openAdvanceSearch()
      })


    );

    setTimeout(() => {
      this.avatarImage = this.auth.avatar_img ? this.auth.avatar_img : this.avatarImage;
      this.org_name = localStorage.getItem('org_name');
      let obj = this.login_track_activity.filter(
        (x) => {
          return x.software.slug.toLowerCase().replace(/\s/g, '') == this.domain.toLowerCase().replace(/\s/g, '')
        });
      if (obj.length > 0) {
        this.is_trial = obj[0].is_trial;
      }
    }, 2000);

    this.dataEditor.notificationCount.subscribe(res => {
      this.notificationCount = res;
    });
    var pagingRequestModel = {
      page: 1,
      page_size: 10
    }
    this.apiService.getNotificationsList(pagingRequestModel).subscribe((res) => {
      this.notificationCount = res.pagination.unread_count;
    });
  }

  ngAfterViewInit(): void {
    if (this.advanceSearchConfig.length == 0) {
      this.getAdvanceSearch();
    }
  }

  getAdvanceSearch() {
    this.sidenavService.getAdvanceSearch().subscribe((res) => {
      this.advanceSearchConfig = res;
    });
  }

  featureCheck(value) {
    return this.sidenavService.featureCheck(value);
  }
  resetFilter(model) {
    model['allData'] = true;
    model['page'] = 1;
    model['page_size'] = PAGE_SIZE_10;
    this.apiService.onSearch(model).subscribe((response) => {
      this.eventService.emit(new EmitEvent(model.module, {
        response: response
      }));
    });
  }
  openDrawer(s: string) {
    this.fds.closeNav();
    this.fds.setFormName(s);
    this.fds.openNav();
  }
  openAdvanceSearch() {
    this.menuTrigger.closeMenu()
    const dialogRef = this.dialog.open(AdvanceSearchFormComponent, {
      width: '1200px',
      position: { top: '0px' },
      data: this.checkedOption,
    });
  }

  check(route) {
    this.checkedOption = '/' + route;
    this.router.navigateByUrl(route);
  }
  isChecked(route) {
    return this.checkedOption === '/' + route;
  }
}
