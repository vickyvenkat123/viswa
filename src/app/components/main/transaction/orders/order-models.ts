export interface ApiOrderModel {
  id: number;
  uuid: string;
  organisation_id: number;
  customer_id: number;
  lob?: any;
  lob_id?: any;
  depot_id: null;
  order_type_id: number;
  order_number: string;
  order_date: string;
  due_date: string;
  delivery_date: string;
  payment_term_id: number;
  total_qty: string;
  total_discount_amount: string;
  total_vat: string;
  open_qty?: string;
  total_net: string;
  total_excise: string;
  grand_total: string;
  any_comment: string;
  current_stage: string;
  current_stage_comment: string;
  sign_image: string;
  source: number;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  salesman?: any;
  order_type: {
    id: number;
    name: string;
    description: string;
  };
  payment_term: {
    id: number;
    name: string;
    number_of_days: number;
  };
  order_details: ApiOrderDetails[];
  customer_info: ApiOrderCustomerInfo;
  depot: {
    id: number;
    depot_name: string;
  };
  customer?: any,
  customer_lop?: string
}

export interface ApiOrderCustomerInfo {
  id: number;
  user_id: number;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    display_name: string;
  };
}

export interface ApiOrderDetails {
  id: number;
  uuid: string;
  order_id: number;
  item_id: number;
  item_uom_id: number;
  discount_id: number;
  item_gross: number;
  is_free: number;
  open_qty?: string;
  is_item_poi: number;
  promotion_id: number;
  item_qty: string;
  item_expiry_date?: any;
  item_price: string;
  item_discount_amount: string;
  item_vat: string;
  item_net: string;
  item_excise: string;
  item_grand_total: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  item: {
    id: number;
    item_name: string;
    item_code?: string;
    item_main_price?: [];
    item_uom_lower_unit?: {}

  };
  item_uom: {
    id: number;
    name: string;
    code: string;
  };
  order_status?: string;
}

export interface ApiItemPriceStats {
  item_price: string;
  discount: number;
  discount_id: number;
  is_free: boolean;
  is_item_poi: boolean;
  promotion_id: number;
  total_excise: string;
  total_vat: string;
  total_net: string;
  total: string;
  item_gross: number;
  qty?: number;
}

export interface OrderModel {
  id: number;
  order_id?: number;
  lob?: any;
  lob_id?: any;
  uuid: string;
  order_type_id: number;
  customerObj?: any;
  order_type_info?: {
    id: number;
    name: string;
    description: string;
  };
  payment_term_id: number;
  payment_term_info?: {
    id: number;
    name: string;
    number_of_days: number;
  };
  customer: any
  salesman_id?: number;
  depot: {
    depot_id: number;
    depot_name: string;
  };
  salesman?: {
    salesman_id: number;
    salesman_name: string;
  };
  status: number;
  current_stage: string;
  current_stage_comment: string;
  approval_status: number;
  customer_note: string;
  order_date: string;
  delivery_date: string;
  due_date: string;
  order_number: string;
  gross_total: number;
  total_vat: number;
  total_excise: number;
  total_net: number;
  total_discount_amount: number;
  grand_total: number;
  items: OrderItemsPayload[];
  order_details?: OrderItemsPayload[];
  customer_lop?: string;
  delivery_number?: string;
  supplier_recipt_date?: string;
  supplier_recipt_number?: string;
}

export interface OrderType {
  id: number;
  uuid: string;
  organisation_id: number;
  use_for: string;
  name: string;
  description: string;
  prefix_code: string;
  start_range: number;
  end_range: number;
  next_available_code: string;
  status: number;
}

export interface ItemAddTableHeader {
  key: string;
  label: string;
  id: number;
  show?: boolean;
}

export interface OrderItemsPayload {
  item: {
    id: number;
    name: string;
    item_code?: string;
    item_name?: string;
    item_main_price?: [];
    item_uom_lower_unit?: {}
  };

  discount_id?: number;
  promotion_id?: number;
  is_free?: boolean;
  is_item_poi?: boolean;
  reason?: number;
  batch_number?: number;
  item_id?: number;
  item_code?: string;
  invoice_number?: string;
  invoice_total?: string;
  item_condition?: number;
  item_qty: any;
  item_expiry_date?: any;
  open_qty?: string;
  item_uom_id: any;
  item_price: number;
  item_discount_amount: number;
  item_vat: number;
  item_net: number;
  item_excise: number;
  item_grand_total: number;
  uom_info?: {
    id: number;
    name: string;
    code: string;
  };
  item_gross: number;
  qty?: number;
  order_status?: string;
  id?: number;
  delivery_status?: string;
}

export function apiOrderMapper(order: ApiOrderModel): OrderModel {
  const items: OrderItemsPayload[] = order.order_details.map((apiItem) => {
    const newItem: OrderItemsPayload = {
      item: {
        id: apiItem.item?.id,
        name: apiItem.item?.item_name,
        item_code: apiItem.item?.item_code,
        item_main_price: apiItem.item.item_main_price,
        item_uom_lower_unit: apiItem.item.item_uom_lower_unit
      },
      item_id: apiItem.item?.id,
      item_qty: apiItem?.item_qty,
      item_expiry_date: apiItem?.item_expiry_date,
      open_qty: apiItem?.open_qty,
      item_uom_id: apiItem.item_uom?.id.toString(),
      uom_info: apiItem?.item_uom,
      item_price: Number(apiItem?.item_price),
      item_discount_amount: Number(apiItem?.item_discount_amount),
      item_vat: Number(apiItem?.item_vat),
      item_excise: Number(apiItem?.item_excise),
      item_grand_total: Number(apiItem?.item_grand_total),
      item_net: Number(apiItem?.item_net),
      discount_id: apiItem?.discount_id,
      is_free: Boolean(apiItem?.is_free),
      is_item_poi: Boolean(apiItem?.is_item_poi),
      item_gross:
        apiItem && apiItem.item_gross ? Number(apiItem?.item_gross) : 0,
      order_status: apiItem && apiItem.order_status ? apiItem.order_status : '',
      id: apiItem ? apiItem.id : 0,
    };

    return newItem;
  });
  const newOrder: OrderModel = {
    id: order.id,
    uuid: order.uuid,
    order_type_id: order.order_type_id,
    order_type_info: order.order_type,
    payment_term_id: order.payment_term_id,
    payment_term_info: order.payment_term,
    lob: order.lob,
    customerObj: { id: order.customer?.customer_info?.id, user: order.customer, user_id: order.customer?.customer_info?.user_id },
    customer: order.customer_id
      ? {
        customer_id: order.customer_id,
        user_id: order.customer?.customer_info?.user_id,
        customer_name: order.customer
          ? order.customer.firstname + ' ' + order.customer.lastname
          : 'Unknown',
      }
      : undefined,
    depot: order.depot
      ? {
        depot_id: order.depot_id,
        depot_name: order.depot ? order.depot.depot_name : 'Unknown',
      }
      : undefined,
    salesman: order.salesman
      ? {
        salesman_id: order.salesman.id,
        salesman_name: order.salesman ? order.salesman.firstname + " " + order.salesman.lastname : '',
      }
      : null,
    status: order.status,
    current_stage: order.current_stage,
    current_stage_comment: order.current_stage_comment,
    approval_status: 0,
    customer_note: order.any_comment,
    order_date: order.order_date,
    order_number: order.order_number,
    lob_id: order.lob_id,
    delivery_date: order.delivery_date,
    due_date: order.due_date,
    gross_total: Number(order.grand_total),
    total_vat: Number(order.total_vat),
    total_excise: Number(order.total_excise),
    total_net: Number(order.total_net),
    total_discount_amount: Number(order.total_discount_amount),
    grand_total: Number(order.grand_total),
    items,
    customer_lop: order.customer_lop
  };

  return newOrder;
}

export interface DeliveryPayload {
  order_id: number;
  customer_id: number;
  salesman_id: number;
  delivery_number: number;
  delivery_date: string;
  delivery_weight: number;
  payment_term_id: number;
  total_qty: number;
  total_gross: number;
  total_discount_amount: number;
  total_net: number;
  total_vat: number;
  total_excise: number;
  grand_total: number;
  current_stage_comment: string;
  source: number;
  status: number;
  items: DeliveryPayloadItems[];
}

export interface DeliveryPayloadItems {
  item_id: number;
  item_uom_id: number;
  discount_id: number;
  is_free: boolean;
  is_item_poi: boolean;
  promotion_id: number;
  item_qty: number;
  item_expiry_date?: any;
  item_price: number;
  item_gross: number;
  item_discount_amount: number;
  item_net: number;
  item_vat: number;
  item_excise: number;
  item_grand_total: number;
  batch_number: number;
}

export const enum OrderUpdateProcess {
  Pending = 'Pending',
  Rejected = 'Rejected',
  Accept = 'Accept',
  InProcess = 'In-Process',
  PartialDeliver = 'Partial-Delivered',
  Delivered = 'Delivered',
  PartialInvoice = 'Partial-Invoiced',
  Invoiced = 'Invoiced',
  Completed = 'Completed',
  Approved = 'Approved',
  Cancel = 'Cancel',
}

export const enum OrderUpdateProcessColor {
  Rejected = '#d9534f',
  Pending = '#a5621b',
  Accept = '#a5621b',
  InProcess = 'rgb(226 184 66)',
  PartialDeliver = 'rgb(226 184 66)',
  Delivered = '#0f8801',
  PartialInvoice = 'rgb(226 184 66)',
  Invoiced = '#0f8801',
  Completed = '#0f8801',
  Approved = '#0f8801',
  Cancel = '#bd1b1b',
}

export const enum ConvertInvoiceType {
  DirectInvoice = 1,
  OrderToDeliveryToInvoice = 2,
  DeliveryDirectToInvoice = 3,
}

export const enum ConvertDeliveryType {
  DirectDelivery = 1,
  OrderToDelivery = 2,
}
