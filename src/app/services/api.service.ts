import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';
import { CurrencyPipe } from '@angular/common';
import {
  ACCOUNTS_LIST,
  COLLECTIONS_LIST,
  CREDIT_NOTE_LIST,
  CUSTOMER_LIST,
  DELIVERY_LIST,
  GRN_LIST,
  INVOICE_LIST,
  ORDER_LIST,
  PURCHASE_ORDER_LIST,
  REASONS_LIST,
  STOCK_ADJUSTMENT_LIST,
  WAREHOUSE_LIST,
} from '../features/mocks';
import {
  SALES_TARGET_ACHIEVED_DATA,
  SALES_TARGET_LIST,
  SalesTargetEntities,
} from '../features/mocks/sales-target';
import { VanToVanData } from '../components/main/supervisor/van-to-van/van-to-van.model';
import { endpoints } from '../api-list/api-end-points';
import {
  getCurrency,
  getCurrencyDecimalFormat,
  getCurrencyFormat,
  getCurrencyDecimalFormatNew,
} from 'src/app/services/constants';
import { environment } from '../../environments/environment';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  getCashierReceiptAllList(value: any) {
    throw new Error('Method not implemented.');
  }
  public domain = window.location.host.split('.')[0];
  public baseUrl: string = this.domain == 'nfpc' ? environment.nfpcApiUrl : environment.baseApiUrl;
  // baseUrl = 'https://mobiato-msfa.com/application-backend/public/api';
  constructor(private http: HttpClient, private currencyPipe: CurrencyPipe) { }

  signup(data): Observable<any> {
    const url = `${this.baseUrl}/auth/signup`;
    return this.http.post(url, data);
  }

  verfiyToken(token): Observable<any> {
    const url = `${this.baseUrl}/auth/user-verification`;
    return this.http.post(url, { token: token });
  }
  addOrganisation(data, token): Observable<any> {
    const url = `${this.baseUrl}/organisation/add`;
    return this.http.post(url, data);
  }
  updateOrganisation(id: string, data): Observable<any> {
    const url = `${this.baseUrl}/organisation/edit/${id}`;
    return this.http.post(url, data);
  }
  getOrganizaion(): Observable<any> {
    const url = `${this.baseUrl}/organisation/show`;
    return this.http.get(url);
  }
  getAllOrganizationUsers(): Observable<any> {
    const url = `${this.baseUrl}/organisation/users-list`;
    return this.http.get(url);
  }
  getAllOrganisationRoles(): Observable<any> {
    const url = `${this.baseUrl}/org-roles/list`;
    return this.http.get(url);
  }
  deleteOrganisationRole(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/org-roles/delete/${uuid}`);
  }
  getAllOrganisationParentCutomer(roleId): Observable<any> {
    const url = `${this.baseUrl}/org-roles/customer`;
    return this.http.post(url, { role_id: roleId });
  }
  addOrganisationRoles(data): Observable<any> {
    const url = `${this.baseUrl}/org-roles/add`;
    return this.http.post(url, data);
  }
  editOrganisationRoles(id: string, data): Observable<any> {
    const url = `${this.baseUrl}/org-roles/update/${id}`;
    return this.http.post(url, data);
  }

  getPermission(): Observable<any> {
    const url = `${this.baseUrl}/group-wise-permissions/list`;
    return this.http.get(url);
  }

  inviteUser(data): Observable<any> {
    const url = `${this.baseUrl}/invite-user/add`;
    return this.http.post(url, data);
  }
  updateInviteUser(uuid: string, data): Observable<any> {
    const url = `${this.baseUrl}/invite-user/edit/${uuid}`;
    return this.http.post(url, data);
  }
  getAllInviteUser(): Observable<any> {
    const url = `${this.baseUrl}/invite-user/list`;
    return this.http.get(url);
  }
  setPassword(data): Observable<any> {
    const url = `${this.baseUrl}/invite-user/password-change`;
    return this.http.post(url, data);
  }
  getCombiantionList(): Observable<any> {
    const url = `${this.baseUrl}/combination-key`;
    return this.http.get(url);
  }
  getAllPricingPlan(model): Observable<any> {
    model.use_for = 'Pricing';
    const url = `${this.baseUrl}/pricing-paln/list`;
    return this.http.post(url, model);
  }
  getPricingPlan(uuid): Observable<any> {
    const url = `${this.baseUrl}/pricing-paln/edit/${uuid}`;
    return this.http.get(url);
  }
  getLoadRequestData(uuid): Observable<any> {
    const url = `${this.baseUrl}/loadrequest/edit/${uuid}`;
    return this.http.get(url);
  }
  addPricingPlan(data): Observable<any> {
    const url = `${this.baseUrl}/pricing-paln/add`;
    return this.http.post(url, data);
  }
  editPricingPlan(uuid: string, data): Observable<any> {
    const url = `${this.baseUrl}/pricing-paln/edit/${uuid}`;
    return this.http.post(url, data);
  }
  deletePricingPlan(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pricing-paln/delete/${uuid}`);
  }
  addPromotion(data): Observable<any> {
    const url = `${this.baseUrl}/bundle-promotion/add`;
    return this.http.post(url, data);
  }
  editPromotion(id: string, data): Observable<any> {
    const url = `${this.baseUrl}/bundle-promotion/edit/${id}`;
    return this.http.post(url, data);
  }
  getPromotion(uuid): Observable<any> {
    const url = `${this.baseUrl}/bundle-promotion/edit/${uuid}`;
    return this.http.get(url);
  }
  deletePromotion(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/bundle-promotion/delete/${uuid}`);
  }
  getAllPromotions(model): Observable<any> {
    model.use_for = 'Promotion';
    const url = `${this.baseUrl}/bundle-promotion/list`;
    return this.http.post(url, model);
  }
  getAllDiscounts(model): Observable<any> {
    model.use_for = 'Discount';
    const url = `${this.baseUrl}/discount/list`;
    return this.http.post(url, model);
  }
  getDiscount(uuid): Observable<any> {
    const url = `${this.baseUrl}/discount/edit/${uuid}`;
    return this.http.get(url);
  }
  addDiscount(data): Observable<any> {
    const url = `${this.baseUrl}/discount/add`;
    return this.http.post(url, data);
  }
  editDiscount(uuid: string, data): Observable<any> {
    const url = `${this.baseUrl}/discount/edit/${uuid}`;
    return this.http.post(url, data);
  }
  deleteDiscount(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/discount/delete/${uuid}`);
  }

  getAllRebates(model): Observable<any> {
    model.use_for = 'rebate-discount';
    const url = `${this.baseUrl}/rebate-discount/list`;
    return this.http.post(url, model);
  }
  getRebate(uuid): Observable<any> {
    const url = `${this.baseUrl}/rebate-discount/edit/${uuid}`;
    return this.http.get(url);
  }
  addRebate(data): Observable<any> {
    const url = `${this.baseUrl}/rebate-discount/add`;
    return this.http.post(url, data);
  }
  editRebate(uuid: string, data): Observable<any> {
    const url = `${this.baseUrl}/rebate-discount/edit/${uuid}`;
    return this.http.post(url, data);
  }
  deleteRebate(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/rebate-discount/delete/${uuid}`);
  }

  getAllListingFees(model): Observable<any> {
    model.use_for = 'listing-fee';
    const url = `${this.baseUrl}/listing-fee/list`;
    return this.http.post(url, model);
  }
  getListingFee(uuid): Observable<any> {
    const url = `${this.baseUrl}/listing-fee/edit/${uuid}`;
    return this.http.get(url);
  }
  addListingFee(data): Observable<any> {
    const url = `${this.baseUrl}/listing-fee/add`;
    return this.http.post(url, data);
  }
  editListingFee(uuid: string, data): Observable<any> {
    const url = `${this.baseUrl}/listing-fee/edit/${uuid}`;
    return this.http.post(url, data);
  }
  deleteListingFee(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/listing-fee/delete/${uuid}`);
  }

  getAllShelfRents(model): Observable<any> {
    model.use_for = 'sales-price';
    const url = `${this.baseUrl}/sales-price/list`;
    return this.http.post(url, model);
  }
  getShelfRent(uuid): Observable<any> {
    const url = `${this.baseUrl}/sales-price/edit/${uuid}`;
    return this.http.get(url);
  }
  addShelfRent(data): Observable<any> {
    const url = `${this.baseUrl}/sales-price/add`;
    return this.http.post(url, data);
  }

  editShelfRent(uuid: string, data): Observable<any> {
    const url = `${this.baseUrl}/sales-price/edit/${uuid}`;
    return this.http.post(url, data);
  }
  deleteShelfRent(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales-price/delete/${uuid}`);
  }

  getUser(): Observable<any> {
    const url = `${this.baseUrl}/user`;
    return this.http.get(url);
  }
  public getGlobalSetting(): Observable<any> {
    const url = `${this.baseUrl}/global-setting`;
    return this.http.get(url);
  }
  getTheme() {
    return this.http.get(endpoints.apiendpoint.theme.list);
  }
  forkLoginData() {
    return forkJoin([this.getTheme(), this.getGlobalSetting()]);
  }
  public LoginTrack(): Observable<any> {
    const url = `${this.baseUrl}/login-track`;
    return this.http.post(url, {});
  }

  getAfterLoginData() {
    const user = this.getUser().pipe(map((result) => result));
    const global = this.getGlobalSetting().pipe(map((result) => result));
    const permission = this.getPermission().pipe(map((result) => result));
    return forkJoin({ user, global, permission });
  }

  getAllCountries(): Observable<any> {
    const url =
      `${this.baseUrl}/country/all`;
    return this.http.get(url);
  }
  getMasterDataLists(): Observable<any> {
    let obj = {
      "list_data": ["country", "region", "sales_organisation", "area",
        "channel", "customer_category", "route", "salesman", "customer", "merchandiser", "item", "item_uom", "brand", "brand_list", "major_category", "major_category_list", "customer_type", "payment_term", "promotional_item"],
      "function_for": "customer"
    }
    return this.http.post<any>(endpoints.apiendpoint.masterDataCollection.list, obj);
    // return of(CUSTOMER_LIST);
  }

  getMasterDataListsByItem(value): Observable<any> {
    let obj = {
      "list_data": [value],
      "function_for": "customer"
    }
    return this.http.post<any>(endpoints.apiendpoint.masterDataCollection.list, obj);
    // return of(CUSTOMER_LIST);
  }

  getCustomers(): Observable<any> {
    const url = `${this.baseUrl}/customer/list`;
    return this.http.post(url, {});
    // return of(CUSTOMER_LIST);
  }
  addCustomers(data): Observable<any> {
    const url = `${this.baseUrl}/customer/add`;
    return this.http.post(url, data);
  }
  editCustomers(id: string, data): Observable<any> {
    const url = `${this.baseUrl}/customer/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteCustomer(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/delete/${uuid}`);
  }

  addCustomerGroup(data): Observable<any> {
    const url = `${this.baseUrl}/customer-group/add`;
    return this.http.post(url, data);
  }
  editCustomerGroup(id, data): Observable<any> {
    const url = `${this.baseUrl}/customer-group/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteCustomerGroup(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer-group/delete/${uuid}`);
  }

  getAllSalesOrganisations(): Observable<any> {
    const url = `${this.baseUrl}/sales-organisation/list`;
    return this.http.get(url);
  }
  addSalesOrganisation(data): Observable<any> {
    const url = `${this.baseUrl}/sales-organisation/add`;
    return this.http.post(url, data);
  }
  editSalesOrganisation(id, data): Observable<any> {
    const url = `${this.baseUrl}/sales-organisation/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteSalesOrganisation(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales-organisation/delete/${uuid}`);
  }
  getAllChannels(): Observable<any> {
    const url = `${this.baseUrl}/channel/list`;
    return this.http.get(url);
  }
  addChannel(data): Observable<any> {
    const url = `${this.baseUrl}/channel/add`;
    return this.http.post(url, data);
  }
  editChannel(id, data): Observable<any> {
    const url = `${this.baseUrl}/channel/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteChannel(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/channel/delete/${uuid}`);
  }
  getAllSubChannels(): Observable<any> {
    const url = `${this.baseUrl}/sub-channel/list`;
    return this.http.get(url);
  }
  addSubChannel(data): Observable<any> {
    const url = `${this.baseUrl}/sub-channel/add`;
    return this.http.post(url, data);
  }
  editSubChannel(id, data): Observable<any> {
    const url = `${this.baseUrl}/sub-channel/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteSubChannel(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sub-channel/delete/${uuid}`);
  }
  getAllItems(): Observable<any> {
    const url = `${this.baseUrl}/item/list`;
    return this.http.post(url, {});
  }
  addItem(data): Observable<any> {
    const url = `${this.baseUrl}/item/add`;
    return this.http.post(url, data);
  }
  editItem(id, data): Observable<any> {
    const url = `${this.baseUrl}/item/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteItem(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/item/delete/${uuid}`);
  }
  getCountriesList(): Observable<any> {
    const url = `${this.baseUrl}/country/list`;
    return this.http.get(url);
  }

  getCountriesListDt(page = 1, page_size = 10): Observable<any> {
    const url = `${this.baseUrl}/country/list?page=${page}&page_size=${page_size}`;
    return this.http.get(url);
  }
  addCountry(data): Observable<any> {
    const url = `${this.baseUrl}/country/add`;
    return this.http.post(url, data);
  }
  editCountry(id, data): Observable<any> {
    const url = `${this.baseUrl}/country/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteCountry(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/country/delete/${uuid}`);
  }

  getAllRegions(): Observable<any> {
    const url = `${this.baseUrl}/region/list`;
    return this.http.get(url);
  }

  getAllRegionsDt(page = 1, page_size = 10): Observable<any> {
    const url = `${this.baseUrl}/region/list?page=${page}&page_size=${page_size}`;
    return this.http.get(url);
  }
  getAllAreas(): Observable<any> {
    const url = `${this.baseUrl}/area/list`;
    return this.http.get(url);
  }
  getAllSubareas(): Observable<any> {
    const url = `${this.baseUrl}/sub-area/list`;
    return this.http.get(url);
  }
  getAllDepots(): Observable<any> {
    const url = `${this.baseUrl}/depot/list`;
    return this.http.get(url);
  }
  addRegion(data): Observable<any> {
    const url = `${this.baseUrl}/region/add`;
    return this.http.post(url, data);
  }
  addArea(data): Observable<any> {
    const url = `${this.baseUrl}/area/add`;
    return this.http.post(url, data);
  }
  addSubarea(data): Observable<any> {
    const url = `${this.baseUrl}/sub-area/add`;
    return this.http.post(url, data);
  }
  getRegion(): Observable<any> {
    const url = `${this.baseUrl}/region/list`;
    return this.http.get(url);
  }
  editRegion(id, data): Observable<any> {
    const url = `${this.baseUrl}/region/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteRegion(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/region/delete/${uuid}`);
  }
  getAllCurrencyCode(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all-currency`);
  }
  getAllCurrencies(page, page_size): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/currency/list?page=${page}&page_size=${page_size}`
    );
  }
  addCurrency(data): Observable<any> {
    const url = `${this.baseUrl}/currency/add`;
    return this.http.post(url, data);
  }
  editCurrency(id, data): Observable<any> {
    const url = `${this.baseUrl}/currency/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteCurrency(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/currency/delete/${uuid}`);
  }
  deleteSubarea(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sub-area/delete/${uuid}`);
  }
  deleteArea(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/area/delete/${uuid}`);
  }
  editSubarea(uuid: string, data): Observable<any> {
    const url = `${this.baseUrl}/subarea/edit/${uuid}`;
    return this.http.post(url, data);
  }
  editArea(uuid: string, data): Observable<any> {
    const url = `${this.baseUrl}/area/edit/${uuid}`;
    return this.http.post(url, data);
  }

  getAllBrands(): Observable<any> {
    const url = `${this.baseUrl}/brand/list`;
    return this.http.get(url);
  }
  getAllSubBrands(): Observable<any> {
    const url = `${this.baseUrl}/sub-brand/list`;
    return this.http.get(url);
  }
  getAllMajorCategorires(): Observable<any> {
    const url = `${this.baseUrl}/major-category/list`;
    return this.http.get(url);
  }
  getAllSubCategories(): Observable<any> {
    const url = `${this.baseUrl}/sub-category/list`;
    return this.http.get(url);
  }
  getAllItemGroups(): Observable<any> {
    const url = `${this.baseUrl}/item-group/list`;
    return this.http.get(url);
  }
  getAllItemUoms(): Observable<any> {
    const url = `${this.baseUrl}/item-uom/list`;
    return this.http.get(url);
  }

  // Org Master
  public getOrganizationData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/organization/list`);
  }

  // Customer Category Manager
  public getAllCustomerCategory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer-category/list`);
  }
  public getAllCustomerCategoryDt(page = 1, page_size = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/customer-category/list?page=${page}&page_size=${page_size}`
    );
  }

  public addNewCustomerCategory(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customer-category/add`, body);
  }

  public deleteCustomerCategory(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer-category/delete/${uuid}`);
  }

  public editCustomerCategory(uuid: string, body: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/customer-category/edit/${uuid}`,
      body
    );
  }

  public getAllItemCategory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/item_major_category/list`);
  }

  // distributions

  getDistributions(customer_id) {
    return this.http.get(`${this.baseUrl}/planogram/customer/${customer_id}`);
  }

  getDistributionsBycustomers(customer_ids) {
    return this.http.post(`${this.baseUrl}/planogram/customer`, customer_ids);
  }

  // Van Manager
  public getAllVans(): Observable<any> {
    return this.http.get(`${this.baseUrl}/van/list`);
  }

  public getAllVansDt(page = 1, page_size = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/van/list?page=${page}&page_size=${page_size}`
    );
  }

  public addNewVan(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/van/add`, body);
  }

  public deleteVan(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/van/delete/${uuid}`);
  }

  public editVan(uuid: string, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/van/edit/${uuid}`, body);
  }

  // Van Type Manager
  public getAllVanTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/van-type/list`);
  }

  public addNewVanTypes(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/van-type/add`, body);
  }

  public editVanTypes(uuid, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/van-type/add/${uuid}`, body);
  }

  public deleteVanTypes(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/van-type/delete/${uuid}`);
  }

  // Van Category Manager
  public getAllVanCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/van-category/list`);
  }

  public addNewVanCategories(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/van-category/add`, body);
  }

  public editVanCategories(uuid, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/van-category/edit/${uuid}`, body);
  }

  public deleteVanCategories(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/van-category/delete/${uuid}`);
  }

  // Branch/Depot Manager
  public getAllBranchDepot(): Observable<any> {
    return this.http.get(`${this.baseUrl}/depot/list`);
  }

  public getAllBranchDepotDt(page = 1, page_size = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/depot/list?page=${page}&page_size=${page_size}`
    );
  }

  public addNewBranchDepot(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/depot/add`, body);
  }

  public deleteBranchDepot(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/depot/delete/${uuid}`);
  }

  public editBranchDepot(uuid: string, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/depot/edit/${uuid}`, body);
  }

  // Route Manager

  getAllRouteItemGroupDataList(): Observable<any> {
    // const routeID = this.getAllRoute().pipe(map((result) => result));
    const itemData = this.getAllItems().pipe(
      map((result) => result)
    );
    const merchandisers = this.getAllMerchandisers().pipe(
      map((result) => result)
    );
    return forkJoin({ itemData, merchandisers });
  }

  public getAllRoute(): Observable<any> {
    return this.http.get(`${this.baseUrl}/route/list`);
  }

  public getAllRouteDt(page = 1, page_size = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/route/list?page=${page}&page_size=${page_size}`
    );
  }

  public addNewRoute(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/route/add`, body);
  }

  public deleteRoute(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/route/delete/${uuid}`);
  }

  public editRoute(uuid: string, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/route/edit/${uuid}`, body);
  }

  // Outlet Product Code - Manager
  public getAllOutletProductCode(): Observable<any> {
    return this.http.get(`${this.baseUrl}/outlet-product/list`);
  }

  public getAllOutletProductCodeDt(page = 1, page_size = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/outlet-product/list?page=${page}&page_size=${page_size}`
    );
  }

  public addNewOutletProductCode(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/outlet-product/add`, body);
  }

  public deleteOutletProductCode(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/outlet-product/delete/${uuid}`);
  }

  public editOutletProductCode(uuid: string, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/outlet-product/edit/${uuid}`, body);
  }

  // Major Category
  getMajor(): Observable<any> {
    const url = `${this.baseUrl}/major-category/list`;
    return this.http.get(url);
  }
  addMajor(data): Observable<any> {
    const url = `${this.baseUrl}/major-category/add`;
    return this.http.post(url, data);
  }
  editMajor(id, data): Observable<any> {
    const url = `${this.baseUrl}/major-category/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteMajor(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/major-category/delete/${uuid}`);
  }

  // Sub Category
  getSubCategory(): Observable<any> {
    const url = `${this.baseUrl}/sub-category/list`;
    return this.http.get(url);
  }
  addSubCategory(data): Observable<any> {
    const url = `${this.baseUrl}/sub-category/add`;
    return this.http.post(url, data);
  }
  editSubCategory(id, data): Observable<any> {
    const url = `${this.baseUrl}/sub-category/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteSubCategory(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sub-category/delete/${uuid}`);
  }

  // Item Group
  getItemGroup(): Observable<any> {
    const url = `${this.baseUrl}/item-group/list`;
    return this.http.get(url);
  }

  getItemGroupDt(page = 1, page_size = 10): Observable<any> {
    const url = `${this.baseUrl}/item-group/list?page=${page}&page_size=${page_size}`;
    return this.http.get(url);
  }
  addItemGroup(data): Observable<any> {
    const url = `${this.baseUrl}/item-group/add`;
    return this.http.post(url, data);
  }
  editItemGroup(id, data): Observable<any> {
    const url = `${this.baseUrl}/item-group/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteItemGroup(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/item-group/delete/${uuid}`);
  }
  // approve item
  approveItem(uuid: string): Observable<any> {
    console.log('uuid', uuid)
    let payload = {
      action: true,
    };
    return this.http.post<any>(
      endpoints.apiendpoint.approvalRequest.requestForApproval(uuid),
      payload
    );
  }
  // Reject Item approval
  rejectItemApproval(uuid: string): Observable<any> {
    let payload = {
      action: false,
    };
    return this.http.post<any>(
      endpoints.apiendpoint.approvalRequest.requestForApproval(uuid),
      payload
    );
  }

  // Item Uoms
  getItemUom(): Observable<any> {
    const url = `${this.baseUrl}/item-uom/list`;
    return this.http.get(url);
  }
  getItemUomDt(page = 1, page_size = 10): Observable<any> {
    const url = `${this.baseUrl}/item-uom/list?page=${page}&page_size=${page_size}`;
    return this.http.get(url);
  }
  addItemUom(data): Observable<any> {
    const url = `${this.baseUrl}/item-uom/add`;
    return this.http.post(url, data);
  }
  editItemUom(id, data): Observable<any> {
    const url = `${this.baseUrl}/item-uom/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteItemUom(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/item-uom/delete/${uuid}`);
  }
  // Brand
  getBrandlist(): Observable<any> {
    const url = `${this.baseUrl}/brand/list`;
    return this.http.get(url);
  }
  addBrandItem(data): Observable<any> {
    const url = `${this.baseUrl}/brand/add`;
    return this.http.post(url, data);
  }
  editBrandItem(id, data): Observable<any> {
    const url = `${this.baseUrl}/brand/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteBrandItem(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/brand/delete/${uuid}`);
  }
  // subbrand
  getSubbrandItem(): Observable<any> {
    const url = `${this.baseUrl}/sub-brand/list`;
    return this.http.get(url);
  }
  addSubbrandItem(data): Observable<any> {
    const url = `${this.baseUrl}/sub-brand/add`;
    return this.http.post(url, data);
  }
  editSubbrandItem(id, data): Observable<any> {
    const url = `${this.baseUrl}/sub-brand/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteSubbrandItem(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sub-brand/delete/${uuid}`);
  }

  // Salesman Manager
  getSalesMan(): Observable<any> {
    const url = `${this.baseUrl}/salesman/list`;
    return this.http.post(url, {});
  }

  getSalesmanLoginInfo(obj) {
    return this.http.post<any>(
      `${this.baseUrl}/salesman-login-log/list`,
      obj
    );
  }

  getSalesmanActivityDetails(obj) {
    return this.http.post<any>(
      `${this.baseUrl}/customer-visit/salesman/list`,
      obj
    );
  }
  getSalesmanByRoute(id: number): Observable<any> {
    return this.http.get<any>(endpoints.apiendpoint.route.getSalemanByRoute(id));
  }
  getSalesmanType(): Observable<any> {
    const url = `${this.baseUrl}/salesman-type/list`;
    return this.http.get(url);
  }
  getSalesmanRoles(): Observable<any> {
    const url = `${this.baseUrl}/salesman-role/list`;
    return this.http.get(url);
  }
  addSalesMan(data): Observable<any> {
    const url = `${this.baseUrl}/salesman/add`;
    console.log('salesData', data)
    return this.http.post(url, data);
  }
  editSalesMan(id: string, data): Observable<any> {
    const url = `${this.baseUrl}/salesman/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteSalesMan(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/salesman/delete/${uuid}`);
  }
  getSalesmanSuperviourCategory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/supervisor-category/list`);
  }
  updateSalesmanSupervisorCategory(id: string, data): Observable<any> {
    const url = `${this.baseUrl}/supervisor-category/edit/${id}`;
    return this.http.post(url, data);
  }
  addSalesmanSupervisorCategory(data): Observable<any> {
    const url = `${this.baseUrl}/supervisor-category/add`;
    return this.http.post(url, data);
  }
  deleteSalesmanSupervisorCategory(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/supervisor-category/delete/${uuid}`);
  }

  // TAX
  getAllvat() { }

  // Journey Plan Manager

  public getCustomersByMerchandiser(obj): Observable<any> {
    if (obj.type == 'merchandiser') {
      return this.http.get(`${this.baseUrl}/merchandiser/customer/${obj.id}`);
    } else {
      return this.http.post(`${this.baseUrl}/route/customer`, {
        route_id: obj.id,
      });
    }
  }

  // Orders Manager
  public getAllOrders(): Observable<any> {
    // return of(ORDER_LIST);
    return this.http.get(`${this.baseUrl}/order/list`);
  }

  public getOrderByKey(uuid: string): Observable<any> {
    // return of({ data: ORDER_LIST.data.find((item) => item.uuid === uuid) });
    return this.http.get(`${this.baseUrl}/order/edit/${uuid}`);
  }

  public getOrderItemStats(params: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/order/item-apply-price`, params);
  }

  public addNewOrder(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/order/add`, body);
  }

  public editOrder(uuid: string, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/order/edit/${uuid}`, body);
  }
  public deleteOrder(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/order/delete/${uuid}`);
  }

  public getOrderTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/order-type/list`);
  }

  public addOrderType(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/order-type/add`, body);
  }

  // Invoice Manager
  public getInvoices(): Observable<any> {
    return of(INVOICE_LIST);
    // return this.http.get(`${this.baseUrl}/invoice/list`);
  }

  public addNewInvoice(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/invoice/add`, body);
  }

  public getInvoiceByKey(uuid: string): Observable<any> {
    const pickedInvoice = INVOICE_LIST.data.find(
      (invoice) => invoice.uuid === uuid
    );

    return of({ data: pickedInvoice });
    return this.http.get(`${this.baseUrl}/invoice/show/${uuid}`);
  }

  public deleteInvoice(uuid: string): Observable<any> {
    return of({
      data: 'successful',
    });
    // return this.http.delete(`${this.baseUrl}/invoice/delete/${uuid}`);
  }

  public isStockCheck(body): Observable<any> {
    return this.http.post(`${this.baseUrl}/isStockCheck`, body);
  }

  public onHandQtyCheck(body): Observable<any> {
    return this.http.post(`${this.baseUrl}/routeItemQty`, body);
  }

  public isStockCheckList(body): Observable<any> {
    return this.http.post(`${this.baseUrl}/isStockCheckMultiple`, body);
  }

  // Delivery Manager
  public addNewDelivery(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/delivery/add`, body);
  }

  public getAllDeliveries(): Observable<any> {
    // return of(DELIVERY_LIST);
    return this.http.get(`${this.baseUrl}/delivery/list`);
  }

  public getDeliveryByKey(uuid: string): Observable<any> {
    // const pickedOrder = DELIVERY_LIST.data.find((order) => order.uuid === uuid);

    // return of({ data: pickedOrder });
    return this.http.get(`${this.baseUrl}/delivery/edit/${uuid}`);
  }

  public getReturnReasons(): Observable<any> {
    return of(REASONS_LIST);
    // return this.http.get(`${this.baseUrl}/credit-note/list`);
  }

  getReturnReasonsType(): Observable<any> {
    return this.http.get(endpoints.apiendpoint.reasonType.list);
  }

  // Debit Note Manager
  public getDebitNotes(): Observable<any> {
    return of(CREDIT_NOTE_LIST);
    // return this.http.get(`${this.baseUrl}/debit-note/list`);
  }

  public addDebitNote(body: any): Observable<any> {
    return of({
      data: body,
    });
    // return this.http.post(`${this.baseUrl}/debit-note/add`, body);
  }

  public getDebitNoteByKey(uuid: string): Observable<any> {
    const pickedItem = CREDIT_NOTE_LIST.data.find((note) => note.uuid === uuid);

    return of({ data: pickedItem });
    // return this.http.get(`${this.baseUrl}/debit-note/show/${uuid}`);
  }

  public getWarehouses(): Observable<any> {
    return of(WAREHOUSE_LIST);
    // return this.http.get(`${this.baseUrl}/warehouse/list`);
  }

  public getLocationStorageList() {
    return this.http.get<any>(`${this.baseUrl}/storage-location/list`);
  }

  public getStorageList(id) {
    return this.http.get<any>(`${this.baseUrl}/storage/list/${id}`);
  }

  public getStorageItemList(id) {
    return this.http.get<any>(`${this.baseUrl}/storagedetail/list/${id}`);
  }

  public addStorage(body) {
    return this.http.post<any>(`${this.baseUrl}/storage/add`, body);
  }

  public addStorageItem(body) {
    return this.http.post<any>(`${this.baseUrl}/storagedetail/add`, body);
  }

  public editStorage(id, body) {
    return this.http.post<any>(`${this.baseUrl}/storage/edit/${id}`, body);
  }

  public getAccounts(): Observable<any> {
    return of(ACCOUNTS_LIST);
    // return this.http.get(`${this.baseUrl}/warehouse/list`);
  }

  // Sales Target Manager
  // public getSalesTargets(): Observable<any> {
  //   return of(SALES_TARGET_LIST);
  //   // return this.http.get(`${this.baseUrl}/sales-target/list`);
  // }

  // public getSalesTargetByKey(uuid: string): Observable<any> {
  //   return of({
  //     data: SALES_TARGET_LIST.data.find((item) => item.uuid === uuid),
  //   });
  //   // return this.http.get(`${this.baseUrl}/sales-target/edit/${uuid}`);
  // }

  // public addSalesTarget(body: any): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/sales-target/add`, body);
  // }

  // public editSalesTarget(uuid: string, body: any): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/sales-target/edit/${uuid}`, body);
  // }

  public getTargetEntities(): Observable<any> {
    return of(SalesTargetEntities);
  }

  public getAchievedSales(): Observable<any> {
    return of(SALES_TARGET_ACHIEVED_DATA);
  }

  // For Payment Options
  getPaymentOptions(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .get<any>('../../assets/constants/paymentOptions.json', { headers })
      .pipe(map((r) => r));
  }
  //
  getPaymenterms(): Observable<any> {
    const url = `${this.baseUrl}/payment-term/list`;
    return this.http.get(url);
  }
  deletePaymentTerms(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/payment-term/delete/${uuid}`);
  }
  addPaymentTerm(data): Observable<any> {
    const url = `${this.baseUrl}/payment-term/add`;
    return this.http.post(url, data);
  }

  // Bank
  getBanklist(page = 1, page_size = 10): Observable<any> {
    const url = `${this.baseUrl}/bank-information/list?page=${page}&page_size=${page_size}`;
    return this.http.get(url);
  }

  getTaxRateslist(page = 1, page_size = 10): Observable<any> {
    const url = `${this.baseUrl}/tax-rate/list?page=${page}&page_size=${page_size}`;
    return this.http.get(url);
  }

  getTaxSetting(): Observable<any> {
    const url = `${this.baseUrl}/tax-setting/show`;
    return this.http.get(url);
  }


  addBankItem(data): Observable<any> {
    const url = `${this.baseUrl}/bank-information/add`;
    return this.http.post(url, data);
  }
  editBankItem(id, data): Observable<any> {
    const url = `${this.baseUrl}/bank-information/edit/${id}`;
    return this.http.post(url, data);
  }
  deleteBankItem(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/bank-information/delete/${uuid}`);
  }
  // Reason
  getReasonlist(): Observable<any> {
    const url = `${this.baseUrl}/reason/list`;
    return this.http.get(url);
  }
  addReasonItem(data): Observable<any> {
    const url = `${this.baseUrl}/reason/add`;
    return this.http.post(url, data);
  }
  editReasonItem(id, data): Observable<any> {
    const url = `${this.baseUrl}/reason/edit/${id}`;
    return this.http.post(url, data);
  }
  deletReasonItem(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/reason/delete/${uuid}`);
  }

  getReasonCategorylist(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reason-category/list`);
  }

  // Route Item Group
  getRouteItemGroup(model): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/route-item-grouping/list`, model
    );
  }
  addRouteItemGroup(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/route-item-grouping/add`, data);
  }
  editRouteItemGroup(id: string, data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/route-item-grouping/edit/${id}`,
      data
    );
  }
  deleteRouteItemGroup(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/route-item-grouping/delete/${uuid}`);
  }

  //For Portfolio
  addPortfolioData(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/portfolio-management/add`, data);
  }
  getPortfolioData(model): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/portfolio-management/list`, model
    );
  }
  deletePortfolio(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/portfolio-management/delete/${uuid}`);
  }
  editPortfolio(id: string, data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/portfolio-management/edit/${id}`,
      data
    );
  }
  // For Preference Nav Options
  getPreferenceNavOptions(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .get<any>('../../assets/constants/preferenceNavOptions.json', { headers })
      .pipe(map((r) => r));
  }

  // For Preference Nav Options
  getTaxNavOptions(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .get<any>('../../assets/constants/taxNavOptions.json', { headers })
      .pipe(map((r) => r));
  }

  getReportNavOptions(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    let url = '../../assets/constants/reportOptions.json';
    // switch (this.domain) {
    //   case "merchandising":
    //     url += 'merchandisingReportOptions.json';
    //     break;
    //   case "vansales":
    //     url += 'vansalesReportOptions.json';
    //     break;
    //   default:
    //     url += 'vansalesReportOptions.json';
    //     break;
    // }
    return this.http
      .get<any>(url, {
        headers,
      })
      .pipe(map((r) => r));
  }

  getSosNavOptions(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .get<any>('../../assets/constants/sosOptions.json', {
        headers,
      })
      .pipe(map((r) => r));
  }

  public activityProfileLists(): Observable<any> {
    let obj = {
      "list_data": ["customer", "merchandiser"],
      "function_for": "customer"
    }
    return this.http.post<any>(endpoints.apiendpoint.masterDataCollection.list, obj);
    // const customers = this.getCustomers().pipe(map((result) => result));
    // const merchandisers = this.getMasterDataLists().pipe(
    //   map((result) => result)
    // );
    // return forkJoin({ customers, merchandisers });
  }

  public addActivityProfile(body): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/salesman-activity-profile/add`,
      body
    );
  }

  public updateActivityProfile(body, uuid): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/salesman-activity-profile/edit/${uuid}`,
      body
    );
  }

  public deleteActivityProfile(uuid): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/salesman-activity-profile/delete/${uuid}`
    );
  }

  // For Code setting
  addCodeSetting(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/code-setting`, data);
  }

  getNextCommingCode(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/get-next-comming-code`, data);
  }

  // Work Flow rule
  getWorkFlowModuleList(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/work-flow-module/list`);
  }

  addWorkFlow(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/work-flow/add`, data);
  }

  getWorkFlowList(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/work-flow/list`);
  }

  deleteWorkFlowItem(uuid: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/work-flow/delete/${uuid}`);
  }
  editWorkFlow(id: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/work-flow/edit/${id}`, data);
  }

  getActivityProfileList(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/salesman-activity-profile/list`);
  }

  getVanToVanById(uuid: string): Observable<any> {
    return of({ data: VanToVanData.find((item) => item.uuid === uuid) });
    // return this.http.get(`${this.baseUrl}/grn/edit/${uuid}`);
  }
  //warehouse
  getwarehouseList(page = 1, page_size = 10): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/warehouse/list?page=${page}&page_size=${page_size}`
    );
  }
  addwarehouseItem(data): Observable<any> {
    const url = `${this.baseUrl}/warehouse/add`;
    return this.http.post(url, data);
  }
  editwarehouseItem(id, data): Observable<any> {
    const url = `${this.baseUrl}/warehouse/edit/${id}`;
    return this.http.post(url, data);
  }
  deletewarehouse(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/warehouse/delete/${uuid}`);
  }
  //depoot
  getDepot(id: any) {
    const url = `${this.baseUrl}/depot-route/${id}`;
    return this.http.get(url);
  }
  //stock
  addStockItem(data): Observable<any> {
    const url = `${this.baseUrl}/warehousedetail/add`;
    return this.http.post(url, data);
  }
  getStockList(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/warehousedetail/list/${id}`);
  }
  //ven
  getVendorlist(): Observable<any> {
    const url = `${this.baseUrl}/vendor/list`;
    return this.http.get(url);
  }
  addVendorItem(data): Observable<any> {
    const url = `${this.baseUrl}/vendor/add`;
    return this.http.post(url, data);
  }
  editVendoeItem(uuid, data): Observable<any> {
    const url = `${this.baseUrl}/vendor/edit/${uuid}`;
    return this.http.post(url, data);
  }
  deleteVendorItem(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/vendor/delete/${uuid}`);
  }

  //purchse order
  public getPurchaseOrders(page = 1, page_size = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/purchaseorder/list?page=${page}&page_size=${page_size}`
    );
  }
  public addPuchaseOrders(data): Observable<any> {
    const url = `${this.baseUrl}/purchaseorder/add`;
    return this.http.post(url, data);
  }
  public editPurchaseOrders(uuid, data): Observable<any> {
    const url = `${this.baseUrl}/purchaseorder/edit/${uuid}`;
    return this.http.post(url, data);
  }

  public getPurchaseOrderByKey(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/purchaseorder/edit/${uuid}`);
  }
  public deletPurchaseeOrder(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/purchaseorder/delete/${uuid}`);
  }
  /////Stock adjustment
  public getStockAdjustments(page = 1, page_size = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/stock-adjustment/list?page=${page}&page_size=${page_size}`
    );
  }
  public getStockAdjustmentByKey(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/stock-adjustment/edit/${uuid}`);
  }
  deleteStockAdjustment(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/stock-adjustment/delete/${uuid}`);
  }
  convertToStockAdjustment(uuid: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/stock-adjustment/convertoadjustment/${uuid}`
    );
  }
  public addStockAdjustment(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/stock-adjustment/add`, body);
  }
  public getAccount() {
    return this.http.get(`${this.baseUrl}/account/list`);
  }
  public editStockAdjustment(uuid: string, body: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/stock-adjustment/edit/${uuid}`,
      body
    );
  }
  ////Depot & Expairy Goods

  public getDepotExpairyGoods(page = 1, page_size = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/depot-damage-expiry/list?page=${page}&page_size=${page_size}`
    );
  }
  public getDepotExpairykey(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/depot-damage-expiry/edit/${uuid}`);
  }
  deleteDepotExpairyGoods(uuid: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/depot-damage-expiry/delete/${uuid}`
    );
  }
  public AddDepotExpairyGoods(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/depot-damage-expiry/add`, body);
  }

  public editDepotExpairyGoods(uuid: string, body: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/depot-damage-expiry/edit/${uuid}`,
      body
    );
  }

  // GRN Manager
  public getGRNs(model): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/goodreceiptnote/list`, model
    );
    // return this.http.get(`${this.baseUrl}/grn/list`);
  }

  public getGRNByKey(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/goodreceiptnote/edit/${uuid}`);
    // return this.http.get(`${this.baseUrl}/grn/edit/${uuid}`);
  }

  public addGRN(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/goodreceiptnote/add`, body);
  }

  public editGRN(uuid: string, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/goodreceiptnote/edit/${uuid}`, body);
  }

  public deleteGRN(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/goodreceiptnote/delete/${uuid}`);
  }
  ///Expenses
  public getExpensess(page = 1, page_size = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/expenses/list?page=${page}&page_size=${page_size}`
    );
    // return this.http.get(`${this.baseUrl}/grn/list`);
  }

  public editExpense(uuid: string, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/expenses/edit/${uuid}`, body);
    // return this.http.get(`${this.baseUrl}/grn/edit/${uuid}`);
  }

  public addExpenses(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/expenses/add`, body);
  }

  public deleteExpenses(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/expenses/delete/${uuid}`);
  }

  public expenseCategory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/expense-category/list`);
  }
  //Sales Person
  public getSalesperson(): Observable<any> {
    return this.http.get(`${this.baseUrl}/salesperson/list`);
    // return this.http.get(`${this.baseUrl}/grn/list`);
  }
  public addSalesperson(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/salesperson/add`, body);
  }
  //EStimate

  public getEstimate(page = 1, page_size = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/estimation/list?page=${page}&page_size=${page_size}`
    );
    // return this.http.get(`${this.baseUrl}/grn/list`);
  }

  public getEstimationKey(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/estimation/edit/${uuid}`);
    // return this.http.get(`${this.baseUrl}/grn/edit/${uuid}`);
  }

  public addEstimation(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/estimation/add`, body);
  }

  public editEstimation(uuid: string, body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/estimation/edit/${uuid}`, body);
  }

  public deleteEstimation(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/estimation/delete/${uuid}`);
  }
  //van-to-van transfer
  public getVantovanList(page = 1, pag_size = 10): Observable<any> {
    let body = {
      "code": "",
      "sourceroute": "",
      "destinationroute": "",
      "page": page,
      "page_size": pag_size
    };
    return this.http.post(
      `${this.baseUrl}/van-to-van-transfer/list`, body);
    // return this.http.get(`${this.baseUrl}/grn/list`);
  }

  public getVantoVannKey(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/van-to-van-transfer/edit/${uuid}`);
    // return this.http.get(`${this.baseUrl}/grn/edit/${uuid}`);
  }

  public addVantoVan(body: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/van-to-van-transfer/add
  `,
      body
    );
  }

  public editVantoVan(uuid: string, body: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/van-to-van-transfer/edit/${uuid}`,
      body
    );
  }

  public deletevantovan(uuid: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/van-to-van-transfer/delete/${uuid}`
    );
  }

  public getAllMerchandisers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/merchandiser/list`);
  }

  public getAllModules(): Observable<any> {
    return this.http.get(`${this.baseUrl}/module/list`);
  }

  public enableCustomFieldsModules(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/module/add`, body);
  }
  public checkCustomFieldStatus(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/module/checkstatus`, body);
  }

  public saveCustomField(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customfield/add`, body);
  }
  public getCustomField(id: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/module/modulewisefield/${id}`);
  }
  public deleteCustomField(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/customfield/delete/${uuid}`);
  }
  public onSearch(model: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/advanced-search`, model);
  }
  public getHistory(model: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/action-history/list-by-module`,
      model
    );
  }
  public addHistory(model: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/action-history/add`, model);
  }
  public deleteHistory(id): Observable<any> {
    return this.http.get(`${this.baseUrl}/action-history/delete/${id}`);
  }

  public bulkAction(body): Observable<any> {
    return this.http.post(`${this.baseUrl}/global/bulk-action`, body);
  }

  public addTax(body): Observable<any> {
    return this.http.post(`${this.baseUrl}/tax-rate/add`, body);
  }

  public addTaxSetting(body): Observable<any> {
    return this.http.post(`${this.baseUrl}/tax-setting/add`, body);
  }

  public editTaxSetting(id, body): Observable<any> {
    return this.http.post(`${this.baseUrl}/tax-setting/edit/${id}`, body);
  }

  public editTax(id, body): Observable<any> {
    return this.http.post(`${this.baseUrl}/tax-rate/edit/${id}`, body);
  }

  public exportCustomers(data): Observable<any> {
    const url = `${this.baseUrl}/Export/module`;
    return this.http.post(url, data);
  }
  public getShelfRentList(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/sales-price/list`
    );
  }
  public addShelfRentData(data): Observable<any> {
    const url = `${this.baseUrl}/sales-price/add`;
    return this.http.post(url, data);
  }

  public shelfRentFilter(data): Observable<any> {
    const url = `${this.baseUrl}/sales-price/customer?year=${data.year}&month=${data.month}`;
    return this.http.get(url);
  }

  public lsitingFeeFilter(data): Observable<any> {
    const url = `${this.baseUrl}/listing-fee/customer?year=${data.year}&month=${data.month}`;
    return this.http.get(url);
  }

  public rebateDiscountFilter(data): Observable<any> {
    const url = `${this.baseUrl}/rebate-discount/customer?year=${data.year}&month=${data.month}`;
    return this.http.get(url);
  }

  public saveDebitNoteDiscount(data): Observable<any> {
    const url = `${this.baseUrl}/listing-fee/debite_note_document`;
    return this.http.post(url, data);
  }

  public downloadFile(fileurl, type) {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', fileurl);
    link.setAttribute('download', type);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  public numberFormatType(number) {
    if (!getCurrencyFormat()) {
      return number;
    }
    if (number >= 0) {
      if (getCurrencyFormat()?.includes('1,234,567.89')) {
        return this.numberFormat(
          number,
          getCurrencyDecimalFormatNew(),
          '.',
          ','
        );
      } else if (getCurrencyFormat()?.includes('1.234.567,89')) {
        return this.numberFormat(
          number,
          getCurrencyDecimalFormatNew(),
          ',',
          '.'
        );
      } else {
        return this.numberFormat(
          number,
          getCurrencyDecimalFormatNew(),
          ',',
          ' '
        );
      }
    } else {
      return number;
    }
  }

  public numberFormat(number, decimals, dec_point, thousands_sep) {
    var n = number,
      prec = decimals;

    var toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return (Math.round(n * k) / k).toString();
    };

    n = !isFinite(+n) ? 0 : +n;
    prec = !isFinite(+prec) ? 0 : Math.abs(prec);
    var sep = typeof thousands_sep === 'undefined' ? ',' : thousands_sep;
    var dec = typeof dec_point === 'undefined' ? '.' : dec_point;

    var s = prec > 0 ? toFixedFix(n, prec) : toFixedFix(Math.round(n), prec);
    //fix for IE parseFloat(0.55).toFixed(0) = 0;

    var abs = toFixedFix(Math.abs(n), prec);
    var _, i;

    if (abs >= '1000') {
      _ = abs.split(/\D/);
      i = _[0].length % 3 || 3;

      _[0] =
        s.slice(0, i + (n < 0)) + _[0].slice(i).replace(/(\d{3})/g, sep + '$1');
      s = _.join(dec);
    } else {
      s = s.replace('.', dec);
    }

    var decPos = s.indexOf(dec);
    if (prec >= 1 && decPos !== -1 && s.length - decPos - 1 < prec) {
      s += new Array(prec - (s.length - decPos - 1)).join('0') + '0';
    } else if (prec >= 1 && decPos === -1) {
      s += dec + new Array(prec).join('0') + '0';
    }
    return s;
  }

  numberFormatWithSymbol(number) {
    let sNumber = this.currencyPipe.transform(number, getCurrency());
    return this.numberFormatType(sNumber);
  }
  public sendEmail(data: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.global.email, data);
  }
  public getDashboarddata(filterdata: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.dashboard.dashboardData, filterdata);
  }
  public getDashboard2data(filterdata: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.dashboard.dashboard2Data, filterdata);
  }
  public getDashboard3data(filterdata: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.dashboard.dashboard3Data, filterdata);
  }
  public getDashboard4data(filterdata: any): Observable<any> {
    return this.http.post<any>(endpoints.apiendpoint.dashboard.dashboard4Data, filterdata);
  }

  public getLoggedInPermissions() {
    return this.http.get(`${this.baseUrl}/permission`);
  }


  public addCreditLimits(data): Observable<any> {
    const url = `${this.baseUrl}/credit-limit-option/add`;
    return this.http.post(url, data);
  }

  getCreditLimits(): Observable<any> {
    const url = `${this.baseUrl}/credit-limit-option/list`;
    return this.http.get(url);
  }

  getCustomerGroup(): Observable<any> {
    const url = `${this.baseUrl}/customer-group/list`;
    return this.http.get(url);
  }

  public addLob(data): Observable<any> {
    const url = `${this.baseUrl}/lob/add`;
    return this.http.post(url, data);
  }
  public updateLob(id, data): Observable<any> {
    const url = `${this.baseUrl}/lob/edit/${id}`;
    return this.http.post(url, data);
  }

  getLobsByCustomerId(id): Observable<any> {
    const url = `${this.baseUrl}/customer/lob-list/${id}`;
    return this.http.get(url);
  }

  getLobs(): Observable<any> {
    const url = `${this.baseUrl}/lob/list`;
    return this.http.get(url);
  }
  getColleactionList(data): Observable<any> {
    const url = `${this.baseUrl}/cashierreciept/getcollection`;
    return this.http.post(url, data);
  }
  deleteLob(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/lob/delete/${uuid}`);
  }
  getInvoiceVisitItem(routeid, type, date) {
    if (date) {
      return this.http.get(`${this.baseUrl}/customer/invoice-visit-item/detail?route_id=${routeid}&type=${type}&date=${date}`);
    } else {
      return this.http.get(`${this.baseUrl}/customer/invoice-visit-item/detail?route_id=${routeid}&type=${type}`);
    }

  }
  getAllSalesmanLoad(model): Observable<any> {
    const url = `${this.baseUrl}/salesman-load/list`;
    return this.http.post(url, model);
  }
  getAllLoadReq(model): Observable<any> {
    const url = `${this.baseUrl}/loadrequest/list`;
    return this.http.post(url, model);
  }

  getRouteItemQty(model): Observable<any> {
    const url = `${this.baseUrl}/routeItemQty`;
    return this.http.post(url, model);
  }

  getCustomersByRouteIds(routeIds): Observable<any> {
    const url = `${this.baseUrl}/multiple-route/customer`;
    return this.http.post(url, { route_id: routeIds });
  }

  getTodoList(model): Observable<any> {
    const url = `${this.baseUrl}/todo/list`;
    return this.http.post(url, model);
  }
  getDailyActivityList(): Observable<any> {
    const url = `${this.baseUrl}/daily-activity/list`;
    return this.http.get(url);
  }
  getSessionEndrossmentList(model): Observable<any> {
    const url = `${this.baseUrl}/session-endrossment/list`;
    return this.http.post(url, model)
  }
  saveSessionEndrossment(model): Observable<any> {
    const url = `${this.baseUrl}/session-endrossment/add`;
    return this.http.post(url, model)
  }
  getNotificationsList(model): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/notifications`, model
    );
  }

  changeNotificationStatus(model): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/notification/status/change/`, model
    );
  }
  readNotification(notificationId: any, model): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/notification/read/${notificationId}`, model
    );
  }

  getSalesmanData(model): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/get-salesman-data`, model
    );
  }


  postInvoiceOdooData(uuid): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/invoice/odoo-post/${uuid}`, null
    );
  }

  postLoadReuestOdooData(load_request_id): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/loadrequest/post-odoo/${load_request_id}`, null
    );
  }

  postCreditNoteOdooData(uuid): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/creditnotes/odoo-post/${uuid}`, null
    );
  }
  postDebitNoteOdooData(uuid): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/debitnote/odoo-post/${uuid}`, null
    );
  }

  postCollectionOdooData(uuid): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/collection/odoo-post/${uuid}`, null
    );
  }
  postSalesmanUnloadOdooData(uuid): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/salesman-unload/odoo-post/${uuid}`, null
    );
  }
  postGoodReceiptNoteOdooData(uuid): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/goodreceiptnote/odoo-post/${uuid}`, null
    );
  }
  chequeActionOdoo(uuid) {
    return this.http.get(`${endpoints.site.apiurl}/collection/cheque-action-odoo/${uuid}`);
  }

  mappingfield(moduleName: string): Observable<any> {

    var url = "";
    switch (moduleName) {
      case 'Credit Note':
        url = `${endpoints.site.apiurl}/creditnotes/getmappingfield`;
        break;
    }

    return this.http.get<any>(url);
  }

  importReport(payload: any, moduleName: string): Observable<any> {

    var url = "";
    switch (moduleName) {
      case 'Credit Note':
        url = `${endpoints.site.apiurl}/creditnotes/import`;
        break;
    }

    return this.http.post<any>(url, payload);
  }

  submitFinalImport(payload, moduleName: string): Observable<any> {

    var url = "";
    switch (moduleName) {
      case 'Credit Note':
        url = `${endpoints.site.apiurl}/creditnotes/finalimport`;
        break;
    }
    return this.http.post<any>(url, payload);
  }
}
