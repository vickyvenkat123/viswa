export const APP = {
  ORGANIZATION: 1,
  MODULE: {
    COUNTRY: 1,
    REGION: 2,
    BRANCH_DEPOT: 3,
    VAN: 4,
    CUSTOMER: 5,
    ITEMS: 6,
    BANK: 7,
    WAREHOUSE: 8,
    ROUTE: 9,
    SALESMAN: 10,
    VENDOR: 11,
    CURRENCY: 12,
  },
};
export const TEMPLATE_MODULE = [
  { name: 'invoice', title: 'Invoice' },
  {
    name: 'customer',
    title: 'Customer',
  },
  {
    name: 'delivery',
    title: 'Delivery',
  },
  {
    name: 'credit_note',
    title: 'Credit Note',
  },
];
export const PAGE_SIZE = 5;
export const PAGE_SIZE_10 = 10;
export const STATUS = [
  {
    id: 'Pending',
    name: 'Pending',
  },
  {
    id: 'Rejected',
    name: 'Rejected',
  },
  {
    id: 'Approved',
    name: 'Approved',
  },
];

export const ORDER_STATUS = STATUS.concat([
  {
    id: 'Delivered',
    name: 'Delivered',
  },
  {
    id: 'Partial-Deliver',
    name: 'Partial Delivered',
  },
  {
    id: 'Completed',
    name: 'Completed',
  },
]);
export const DELIVERY_STATUS = STATUS.concat([
  {
    id: 'Completed',
    name: 'Completed',
  },
]);
export const INVOICE_STATUS = STATUS.concat([
  {
    id: 'Completed',
    name: 'Completed',
  },
]);
export const PAYMENT_METHOD = [
  { id: 2, name: 'Check' },
  { id: 1, name: 'Cash' },
  { id: 3, name: 'Advance Payment' },
];
