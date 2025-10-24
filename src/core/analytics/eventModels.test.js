/**
 * Unit Tests for Event Models
 * Testing dual-provider event structure and data formatting
 */

import { describe, it, expect } from 'vitest';
import {
  EcommerceItem,
  PurchaseEvent,
  AddToCartEvent,
  ViewItemEvent,
  ViewItemListEvent,
  BeginCheckoutEvent,
} from './eventModels';

describe('EcommerceItem', () => {
  it('should create item with correct properties', () => {
    const item = new EcommerceItem({
      id: 'bundle_123',
      name: 'Europe 5GB - 30 Days',
      category: 'esim_bundle',
      price: 19.99,
      quantity: 2,
      brand: 'ChillSim',
    });

    expect(item.id).toBe('bundle_123');
    expect(item.name).toBe('Europe 5GB - 30 Days');
    expect(item.category).toBe('esim_bundle');
    expect(item.price).toBe(19.99);
    expect(item.quantity).toBe(2);
    expect(item.brand).toBe('ChillSim');
  });

  it('should use default values', () => {
    const item = new EcommerceItem({
      id: 'bundle_123',
      name: 'Test Bundle',
      category: 'esim',
      price: 10,
    });

    expect(item.quantity).toBe(1);
    expect(item.brand).toBe('ChillSim');
  });

  it('should format price to 2 decimals', () => {
    const item = new EcommerceItem({
      id: 'test',
      name: 'Test',
      category: 'test',
      price: 19.999,
    });

    expect(item.price).toBe(20.00);
  });

  it('should generate GA4 format correctly', () => {
    const item = new EcommerceItem({
      id: 'bundle_123',
      name: 'Europe 5GB',
      category: 'esim',
      price: 19.99,
      quantity: 1,
    });

    const ga4Item = item.toGA4Item(0);

    expect(ga4Item).toEqual({
      item_id: 'bundle_123',
      item_name: 'Europe 5GB',
      item_category: 'esim',
      item_brand: 'ChillSim',
      price: 19.99,
      quantity: 1,
      index: 0,
    });
  });

  it('should generate Facebook format correctly', () => {
    const item = new EcommerceItem({
      id: 'bundle_123',
      name: 'Europe 5GB',
      category: 'esim',
      price: 19.99,
      quantity: 2,
    });

    const fbContent = item.toFacebookContent();

    expect(fbContent).toEqual({
      id: 'bundle_123',
      quantity: 2,
      item_price: 19.99,
    });
  });
});

describe('PurchaseEvent', () => {
  it('should create purchase event with correct structure', () => {
    const event = new PurchaseEvent({
      items: [{
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.00,
        quantity: 1,
      }],
      currency: 'RON',
      transactionId: 'order_abc123',
      shipping: 2.60,
      tax: 4.50,
      discount: 0,
      coupon: 'PROMO2024',
      paymentType: 'stripe',
    });

    expect(event.currency).toBe('RON');
    expect(event.transactionId).toBe('order_abc123');
    expect(event.shipping).toBe(2.60);
    expect(event.tax).toBe(4.50);
    expect(event.discount).toBe(0);
    expect(event.coupon).toBe('PROMO2024');
    expect(event.paymentType).toBe('stripe');
    expect(event.items).toHaveLength(1);
    expect(event.items[0]).toBeInstanceOf(EcommerceItem);
  });

  it('should calculate value correctly', () => {
    const event = new PurchaseEvent({
      items: [{
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.00,
        quantity: 1,
      }],
      currency: 'RON',
      transactionId: 'order_abc123',
      shipping: 2.60,
      tax: 4.50,
      discount: 1.00,
    });

    // (19.00 * 1) + 2.60 + 4.50 - 1.00 = 25.10
    expect(event.value).toBe(25.10);
  });

  it('should handle multiple items', () => {
    const event = new PurchaseEvent({
      items: [
        { id: '1', name: 'Item 1', category: 'esim', price: 10.00, quantity: 2 },
        { id: '2', name: 'Item 2', category: 'esim', price: 15.00, quantity: 1 },
      ],
      currency: 'EUR',
      transactionId: 'order_123',
      shipping: 5.00,
      tax: 2.00,
      discount: 0,
    });

    // (10 * 2 + 15 * 1) + 5 + 2 = 42.00
    expect(event.value).toBe(42.00);
    expect(event.items).toHaveLength(2);
  });

  it('should generate GA4 parameters correctly', () => {
    const event = new PurchaseEvent({
      items: [{
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.00,
        quantity: 1,
      }],
      currency: 'RON',
      transactionId: 'order_abc123',
      shipping: 2.60,
      tax: 4.50,
      discount: 0,
      coupon: 'PROMO2024',
      paymentType: 'stripe',
    });

    const ga4Params = event.ga4Parameters;

    expect(ga4Params.event).toBe('purchase');
    expect(ga4Params.ecommerce.currency).toBe('RON');
    expect(ga4Params.ecommerce.value).toBe(26.10);
    expect(ga4Params.ecommerce.transaction_id).toBe('order_abc123');
    expect(ga4Params.ecommerce.shipping).toBe(2.60);
    expect(ga4Params.ecommerce.tax).toBe(4.50);
    expect(ga4Params.ecommerce.coupon).toBe('PROMO2024');
    expect(ga4Params.ecommerce.items).toHaveLength(1);
    expect(ga4Params.payment_type).toBe('stripe');
  });

  it('should generate Facebook parameters correctly', () => {
    const event = new PurchaseEvent({
      items: [{
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.00,
        quantity: 1,
      }],
      currency: 'RON',
      transactionId: 'order_abc123',
      shipping: 2.60,
      tax: 4.50,
      discount: 0,
      coupon: 'PROMO2024',
    });

    const fbParams = event.facebookParameters;

    expect(fbParams.content_type).toBe('product');
    expect(fbParams.currency).toBe('RON');
    expect(fbParams.value).toBe(26.10);
    expect(fbParams.num_items).toBe(1);
    expect(fbParams.contents).toHaveLength(1);
    expect(fbParams.contents[0]).toEqual({
      id: 'bundle_123',
      quantity: 1,
      item_price: 19.00,
    });
    expect(fbParams.shipping).toBe(2.60);
    expect(fbParams.tax).toBe(4.50);
    expect(fbParams.coupon).toBe('PROMO2024');
  });

  it('should omit optional fields when not provided', () => {
    const event = new PurchaseEvent({
      items: [{
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.00,
        quantity: 1,
      }],
      currency: 'EUR',
      transactionId: 'order_123',
      shipping: 0,
      tax: 0,
      discount: 0,
    });

    const ga4Params = event.ga4Parameters;
    const fbParams = event.facebookParameters;

    expect(ga4Params.ecommerce.coupon).toBeUndefined();
    expect(ga4Params.ecommerce.discount).toBeUndefined();
    expect(fbParams.coupon).toBeUndefined();
    expect(fbParams.discount).toBeUndefined();
  });
});

describe('AddToCartEvent', () => {
  it('should create add to cart event', () => {
    const event = new AddToCartEvent({
      item: {
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.99,
        quantity: 1,
      },
      currency: 'EUR',
    });

    expect(event.value).toBe(19.99);
    expect(event.currency).toBe('EUR');
    expect(event.item).toBeInstanceOf(EcommerceItem);
  });

  it('should generate GA4 parameters correctly', () => {
    const event = new AddToCartEvent({
      item: {
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.99,
        quantity: 1,
      },
      currency: 'EUR',
    });

    const ga4Params = event.ga4Parameters;

    expect(ga4Params.event).toBe('add_to_cart');
    expect(ga4Params.ecommerce.currency).toBe('EUR');
    expect(ga4Params.ecommerce.value).toBe(19.99);
    expect(ga4Params.ecommerce.items).toHaveLength(1);
  });

  it('should generate Facebook parameters correctly', () => {
    const event = new AddToCartEvent({
      item: {
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.99,
        quantity: 1,
      },
      currency: 'EUR',
    });

    const fbParams = event.facebookParameters;

    expect(fbParams.content_type).toBe('product');
    expect(fbParams.currency).toBe('EUR');
    expect(fbParams.value).toBe(19.99);
    expect(fbParams.contents).toHaveLength(1);
  });
});

describe('ViewItemEvent', () => {
  it('should create view item event', () => {
    const event = new ViewItemEvent({
      item: {
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.99,
        quantity: 1,
      },
      currency: 'EUR',
    });

    expect(event.value).toBe(19.99);
    expect(event.currency).toBe('EUR');
  });

  it('should generate correct parameters for both providers', () => {
    const event = new ViewItemEvent({
      item: {
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.99,
        quantity: 1,
      },
      currency: 'EUR',
    });

    const ga4Params = event.ga4Parameters;
    const fbParams = event.facebookParameters;

    expect(ga4Params.event).toBe('view_item');
    expect(ga4Params.ecommerce.value).toBe(19.99);
    expect(fbParams.value).toBe(19.99);
  });
});

describe('ViewItemListEvent', () => {
  it('should create view item list event', () => {
    const event = new ViewItemListEvent({
      items: [
        { id: '1', name: 'Item 1', category: 'esim', price: 10.00, quantity: 1 },
        { id: '2', name: 'Item 2', category: 'esim', price: 15.00, quantity: 1 },
      ],
      listName: 'Europe Bundles',
      listId: 'europe',
      currency: 'EUR',
    });

    expect(event.items).toHaveLength(2);
    expect(event.listName).toBe('Europe Bundles');
    expect(event.listId).toBe('europe');
  });

  it('should generate GA4 parameters with list info', () => {
    const event = new ViewItemListEvent({
      items: [
        { id: '1', name: 'Item 1', category: 'esim', price: 10.00, quantity: 1 },
      ],
      listName: 'Europe Bundles',
      listId: 'europe',
      currency: 'EUR',
    });

    const ga4Params = event.ga4Parameters;

    expect(ga4Params.event).toBe('view_item_list');
    expect(ga4Params.ecommerce.item_list_name).toBe('Europe Bundles');
    expect(ga4Params.ecommerce.item_list_id).toBe('europe');
    expect(ga4Params.ecommerce.items).toHaveLength(1);
  });

  it('should calculate total value for Facebook', () => {
    const event = new ViewItemListEvent({
      items: [
        { id: '1', name: 'Item 1', category: 'esim', price: 10.00, quantity: 2 },
        { id: '2', name: 'Item 2', category: 'esim', price: 15.00, quantity: 1 },
      ],
      listName: 'Europe Bundles',
      listId: 'europe',
      currency: 'EUR',
    });

    const fbParams = event.facebookParameters;

    // (10 * 2) + (15 * 1) = 35.00
    expect(fbParams.value).toBe(35.00);
  });
});

describe('BeginCheckoutEvent', () => {
  it('should create begin checkout event', () => {
    const event = new BeginCheckoutEvent({
      items: [{
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.00,
        quantity: 1,
      }],
      currency: 'EUR',
      shipping: 2.50,
      tax: 4.00,
      coupon: 'SAVE10',
    });

    expect(event.value).toBe(25.50); // 19 + 2.5 + 4
    expect(event.shipping).toBe(2.50);
    expect(event.tax).toBe(4.00);
    expect(event.coupon).toBe('SAVE10');
  });

  it('should generate correct parameters for both providers', () => {
    const event = new BeginCheckoutEvent({
      items: [{
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'esim',
        price: 19.00,
        quantity: 1,
      }],
      currency: 'EUR',
      shipping: 2.50,
      tax: 4.00,
    });

    const ga4Params = event.ga4Parameters;
    const fbParams = event.facebookParameters;

    expect(ga4Params.event).toBe('begin_checkout');
    expect(ga4Params.ecommerce.value).toBe(25.50);
    expect(fbParams.value).toBe(25.50);
    expect(fbParams.num_items).toBe(1);
  });
});
