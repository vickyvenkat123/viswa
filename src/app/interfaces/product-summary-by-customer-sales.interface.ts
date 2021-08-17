export interface ProductSummaryByCustomerSalesModel {
    customer_code: string;
    customer_name: string;
    item_code?: string;
    item_name?: string;
    total_sales?: number;
    total_net?: number;
    total_return?: number;
    return_percent?: string;
}