import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Statement } from '@angular/compiler';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService: AuthService;

  constructor(authService: AuthService) {
    Object.assign(this, { authService });
  }

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const statment = req.url.includes('balance_statement.pdf');
    if (statment) {
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/pdf',
          Accept: 'application/pdf',
          Authorization: `Bearer ${this.authService.getToken()}`,
          'x-domain': window.location.host,
        },
      });
    } else if (req.url.includes('import')) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.authService.getToken()}`,
          'x-domain': window.location.host,
        },
      });
    } else if (req.url.includes('ZGETMIGO_DETAILS_SRV')) {
      req = req.clone({
        setHeaders: {
          'accept': '',

        }
      });
    } else {
      let domain = window.location.host;
      if (domain.split(':')[0] == 'localhost' || domain.split('.')[0] == 'mobiato-msfa') {
        domain = 'vansales.mobiato-msfa.com'
      }
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
          'x-domain': domain,
          Authorization: `Bearer ${this.authService.getToken()}`,
        },
      });
    }
    return next.handle(req);
  }
}
