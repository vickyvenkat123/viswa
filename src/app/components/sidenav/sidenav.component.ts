import { Component, OnInit, ViewChild, HostListener, OnDestroy, SimpleChanges } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SidenavService } from 'src/app/services/sidenav.service';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnDestroy {
  activePath: string;
  settingsNav: boolean;
  panelOpenState;
  showTitle: boolean = true;
  sidebarConfig = [];
  sidebarSettingConfig = [];
  domain = window.location.host.split('.')[0];
  constructor(
    private router: Router,
    private sidenavService: SidenavService,
    private fds: FormDrawerService
  ) {
    this.sidenavService.softwareSidebar();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initSideBar();
  }

  initSideBar() {
    this.router.events.subscribe(e => {
      this.fds.close();
      if (e instanceof NavigationEnd) {
        this.activePath = e.url;
        if (this.activePath.includes('/settings')) {
          this.settingsNav = true;
        }
        else {
          this.settingsNav = false;
        }
      }
    })
    if (this.sidebarConfig.length == 0) {
      this.getSideBar();
    }
  }

  getSideBar() {
    this.sidenavService.getSideBar().subscribe((res) => {
      this.sidebarConfig = res;
      // for (let menu of this.sidebarConfig) {
      //   menu.show = this.featureCheck(menu.label);
      // }
      // localStorage.setItem('appSidebar', JSON.stringify(this.sidebarConfig));

    });
    this.sidenavService.getSettingSideBar().subscribe((res) => {
      this.sidebarSettingConfig = res;
    });
  }

  featureCheck(value) {
    return this.sidenavService.featureCheck(value);
  }
  settingFeatureCheckDropDowns(value) {
    return this.sidenavService.settingFeatureCheckDropDowns(value);
  }

  sumenuExistCheck(submenu, hasSubmenu) {
    return this.sidenavService.sumenuExistCheck(submenu, hasSubmenu);
  }

  settingFeatureCheck(value, hasSubmenu) {
    return this.sidenavService.settingFeatureCheck(value, hasSubmenu);
  }

  isSpacing(value) {
    return this.sidenavService.isSpacing(value);
  }
  // onSideNavClick(){
  //   this.showTitle = !this.showTitle;
  //   document.querySelector('body').classList.add('sideclosed');
  // }
  ngOnDestroy() {

  }
  navigateTo(path) {
    const sidebarContainer = document.querySelector('._sidenav');
    // sidebarContainer.classList.add('mobilemenu')
    sidebarContainer.classList.remove('collapse_sidenav')
    this.router.navigate([path]);
  }
  onToggle() {
    const sidebarContainer = document.querySelector('._sidenav');
    //sidebarContainer.classList.remove('mobilemenu')
    sidebarContainer.classList.toggle('collapse_sidenav')
    // this.showTitle = !this.showTitle
  }
  navigateBack() {
    let backNavigationPath: string = this.sidenavService.getBackNavigationPath();
    this.router.navigate([backNavigationPath]);
  }
  isActive(s: string) {
    if (this.router.url.includes(s)) {
      return true;
    }
    else {
      return false;
    }
  }
  isActivePath(s: string) {
    if (this.router.url.startsWith(s))
      return true;
    else
      return false;
  }
  displayRoles(): boolean {
    if (localStorage.getItem('userType') == '1' || localStorage.getItem('userType') == '0') {
      return true;
    } else {
      return false;
    }
  }

}
