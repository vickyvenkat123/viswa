import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public token: string;
  public domain = window.location.host.split('.')[0];
  public baseUrl: string = this.domain == 'nfpc' ? environment.nfpcApiUrl : environment.baseApiUrl;
  // public baseUrl: string = 'https://mobiato-msfa.com/application-backend/public/api';

  private http: HttpClient;

  constructor(http: HttpClient) {
    Object.assign(this, { http });
  }

  public login(userLoginCredential: LoginCredential): Observable<any> {
    let url;
    if (userLoginCredential.type == "system") {
      url = `${this.baseUrl}/auth/login`;
    } else {
      url = `${this.baseUrl}/auth/social-login`;
    }

    return this.http.post(url, userLoginCredential);
  }

  public forgotPassword(forgotForm: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, forgotForm);
  }

  public resetPassword(resetForm: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/reset-password`, resetForm);
  }

  public getToken(): string {
    return localStorage.getItem('token');
  }
  // public logout(): void {
  //   localStorage.setItem('isLoggedIn', 'false');
  //   localStorage.removeItem('token');
  // }

  public logout(): Observable<any> {
    const url = `${this.baseUrl}/logout`;
    return this.http.get(url);
  }

  get avatar_img() {
    return JSON.parse(localStorage.getItem('avatar_img'));
  }

  public errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    //console.log(errorMessage);
    return throwError(errorMessage);
  }
}
interface LoginCredential {
  email: string;
  password: string;
  type: string;
}
