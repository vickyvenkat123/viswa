import { Injectable } from '@angular/core';
import { endpoints } from 'src/app/api-list/api-end-points';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { NetworkService } from 'src/app/services/network.service';
import { ApiService } from 'src/app/services/api.service';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PricingPlanService {

  constructor(private apiService: ApiService, private network: NetworkService) {
    Object.assign(this, {});
  }

  exportPromotion(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.Promotional.export(), payload
    );
  }

  importPromotion(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.Promotional.import('import'), payload
    );
  }

  exportPricing(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.pricing.export(), payload
    );
  }

  importPricing(payload): Observable<any> {
    return this.network.post(
      endpoints.apiendpoint.pricing.import('import'), payload
    );
  }

  public getItmesLists(): Observable<any> {
    const items = this.apiService.getAllItems().pipe(map((result) => result));
    const uoms = this.apiService.getAllItemUoms().pipe(map((result) => result));
    return forkJoin({ items, uoms });
  }

}
