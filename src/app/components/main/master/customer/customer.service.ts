import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from 'src/app/api-list/api-end-points';

@Injectable()
export class CustomerService {
  constructor(private http: HttpClient) { }

  approveCustomer(uuid: string): Observable<any> {
    let payload = {
      action: true,
    };
    return this.http.post<any>(
      endpoints.apiendpoint.approvalRequest.requestForApproval(uuid),
      payload
    );
  }

  rejectCustomerApproval(uuid: string): Observable<any> {
    let payload = {
      action: false,
    };
    return this.http.post<any>(
      endpoints.apiendpoint.approvalRequest.requestForApproval(uuid),
      payload
    );
  }

  getCustomerDetail(
    uuid: number,
    pageNumber: number,
    pageSize: number,
    module: string,
    lob_id: number = 0
  ): Observable<any> {
    return this.http.get<any>(
      endpoints.apiendpoint.customer.detail(uuid, pageNumber, pageSize, module, lob_id)
    );
  }

  addComment(payload: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.customer.comments.add(),
      payload
    );
  }

  commentList(id: number): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.customer.comments.list(id));
  }

  deleteComment(uuid: any): Observable<any> {
    return this.http.get<any>(
      endpoints.apiendpoint.customer.comments.delete(uuid)
    );
  }

  getInvoiceChart(payload): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.customer.chart(), payload);
  }

  getBalance(customerId: number, lob_id = 0): Observable<any> {
    return this.http.get<any>(
      endpoints.apiendpoint.customer.balance(customerId) + `?lob_id=${lob_id}`
    );
  }

  getStatement(payload: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.customer.statement(),
      payload
    );
  }

  importCustomer(payload: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.customer.importCustomer('import'),
      payload
    );
  }

  submitImportCustomer(payload): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.customer.finalimport(),
      payload
    );
  }

  customerMappingfield() {
    return this.http.get<any>(endpoints.apiendpoint.customer.mapingField());
  }

  // customer/getmappingfield

  downloadPdf(payload: any): Observable<any> {
    return this.http.post<any>(
      endpoints.apiendpoint.customer.statement(),
      payload
    );
  }
  getPdf(url: any): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers
      .set('Accept', 'application/pdf')
      .set('Content-Type', 'application/pdf');
    return this.http.get<any>(url, { headers, responseType: 'blob' as 'json' });
  }
}
