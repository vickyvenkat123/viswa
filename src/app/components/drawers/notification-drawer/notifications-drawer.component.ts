import { Component, OnInit } from '@angular/core';
import { FormDrawerService } from 'src/app/services/form-drawer.service';
import { ApiService } from 'src/app/services/api.service';
import { array } from '@amcharts/amcharts4/core';
import { NotificationModel, NotificationPaginationModel, NotificationPagingRequestModel } from 'src/app/interfaces/notification.interface';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { DataEditor } from 'src/app/services/data-editor.service';

@Component({
  selector: 'app-notifications-drawer',
  templateUrl: './notifications-drawer.component.html',
  styleUrls: ['./notifications-drawer.component.scss']
})
export class NotificationsDrawerComponent implements OnInit {
  notifications: Array<NotificationModel> = [];
  pagingRequestModel: NotificationPagingRequestModel;
  paginationModel: NotificationPaginationModel;
  constructor(
    private fds: FormDrawerService,
    private apiService: ApiService,
    private router: Router,
    private dataEditor: DataEditor,
  ) {
    this.pagingRequestModel = {
      page: 1,
      page_size: 10
    }
    this.paginationModel = {
      total_records: 0,
    }
  }

  ngOnInit(): void {
    this.notifications = [];
    this.getNotifications();
  }

  close() {
    this.fds.closeNav();
  }

  readNotification(notification: NotificationModel) {
    this.apiService.readNotification(notification.id, null).subscribe((res) => {
      this.notifications.map(x => {
        if (x.id == notification.id && x.is_read == 0) {
          x.is_read = 1;
          this.paginationModel.unread_count = this.paginationModel.unread_count - 1;
          this.dataEditor.updateNotificationCount(this.paginationModel.unread_count)

        }

      });
      this.close();
      switch (notification.type.toLowerCase()) {
        case 'load request':
          this.router.navigate(['/target/load-request'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'customer':
          this.router.navigate(['/masters/customer'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'invoice':
          this.router.navigate(['/transaction/invoice'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'order':
          this.router.navigate(['/transaction/order'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'delivery':
          this.router.navigate(['/transaction/delivery'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'collection':
          this.router.navigate(['/transaction/collection'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'credit note':
          this.router.navigate(['/transaction/credit-note'], { queryParams: { uuid: notification.uuid } })
          break;
        case 'debit note':
          this.router.navigate(['/transaction/debit-note'], { queryParams: { uuid: notification.uuid } })
          break;
      }
    });
  }

  loadNotification() {
    this.pagingRequestModel.page++;
    this.getNotifications();
  }

  getNotifications() {
    this.apiService.getNotificationsList(this.pagingRequestModel).subscribe((res) => {
      var notifications = res.data;
      this.paginationModel = res.pagination;
      this.dataEditor.updateNotificationCount(this.paginationModel.unread_count);

      notifications.map(x => {
        let date = moment(x.created_at);
        let days = moment().diff(date, 'days');

        if (days == 1) {
          x.postTiming = "Tomorrow";

        } else if (days > 1) {
          x.postTiming = date.format('YYYY-MM-DD HH:mm a');

        } else if (days == 0) {

          let hours = moment().diff(date, 'hours');
          if (hours > 0) {
            x.postTiming = hours + (hours == 1 ? " hour ago" : " hours ago");
          }
          if (hours == 0) {
            let minutes = moment().diff(date, 'minutes');
            if (minutes > 0) {
              x.postTiming = (minutes == 1 ? "A minute ago" : minutes + " minutes ago");
            } else {
              x.postTiming = "Now";
            }
          }
        }
        this.notifications.push(x);
      });
    });
  }


}
