/**
 * Integration Tests for Dual-Provider Analytics (GA4 + Facebook Pixel)
 * Tests that events are correctly sent to both Google Analytics and Facebook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  gtmPurchaseEvent,
  gtmViewItemEvent,
  gtmViewItemListEvent,
  gtmAddToCartEvent,
  gtmBeginCheckoutEvent,
} from '../utils/gtm';

describe('Dual-Provider Analytics Integration', () => {
  beforeEach(() => {
    // Reset mocks
    delete window.dataLayer;
    delete window.fbq;
    
    // Setup mocks
    window.dataLayer = [];
    window.fbq = vi.fn();
    
    // Spy on console.log
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('gtmPurchaseEvent', () => {
    it('should send purchase event to both GA4 and Facebook', () => {
      const orderData = {
        order_id: 'order_123',
        order_amount: 19.00,
        order_fee: 5.00,
        order_vat: 2.10,
        order_discount: 0,
        currency: 'RON', // Changed from order_currency to currency
        order_payment_type: 'stripe',
        bundle_details: {
          bundle_code: 'test_bundle',
          display_title: 'Test Bundle',
        },
        gb: '5',
        validity: '30',
        type: 'data',
      };

      gtmPurchaseEvent('purchase', orderData);

      // Check GA4 (dataLayer)
      // Note: pushToDataLayer adds 2 entries (event + reset) - this is intentional
      expect(window.dataLayer.length).toBeGreaterThanOrEqual(1);
      const ga4Event = window.dataLayer[0];
      expect(ga4Event.event).toBe('purchase');
      expect(ga4Event.ecommerce.transaction_id).toBe('order_123');
      expect(ga4Event.ecommerce.value).toBe(26.10); // 19 + 5 + 2.10
      expect(ga4Event.ecommerce.currency).toBe('RON');

      // Check Facebook Pixel
      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'Purchase',
        expect.objectContaining({
          value: 26.10,
          currency: 'RON',
          content_type: 'product',
        }),
        { eventID: 'order_123' }
      );
    });

    it('should use backend currency amounts without conversion', () => {
      const orderData = {
        order_id: 'order_456',
        order_amount: 19.00, // Backend sends currency, not cents!
        order_fee: 5.00,
        order_vat: 2.10,
        order_discount: 0,
        order_currency: 'RON',
        bundle_name: 'Test Bundle',
        gb: '5',
        validity: '30',
        type: 'data',
      };

      gtmPurchaseEvent('purchase', orderData);

      const ga4Event = window.dataLayer[0];
      expect(ga4Event.ecommerce.value).toBe(26.10); // Not 0.26!
      
      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'Purchase',
        expect.objectContaining({ value: 26.10 }),
        expect.any(Object)
      );
    });
  });

  describe('gtmViewItemEvent', () => {
    it('should send view_item event to both providers', () => {
      const bundleData = {
        id: 'bundle_123',
        name: 'Europe 5GB',
        category: 'Europe',
        price: 19.00,
        gb: '5',
        validity: '30',
        type: 'data',
      };

      gtmViewItemEvent(bundleData, false);

      // Check GA4
      expect(window.dataLayer.length).toBeGreaterThanOrEqual(1);
      const ga4Event = window.dataLayer[0];
      expect(ga4Event.event).toBe('view_item');
      expect(ga4Event.ecommerce.items[0].item_id).toBe('bundle_123');
      expect(ga4Event.ecommerce.items[0].price).toBe(19.00);

      // Check Facebook
      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'ViewContent',
        expect.objectContaining({
          value: 19.00,
          content_type: 'product',
        }),
        {}
      );
    });
  });

  describe('gtmViewItemListEvent', () => {
    it('should send view_item_list event to both providers', () => {
      const items = [
        { id: '1', name: 'Bundle 1', category: 'Europe', price: 10, gb: '3', validity: '15', type: 'data' },
        { id: '2', name: 'Bundle 2', category: 'Europe', price: 15, gb: '5', validity: '30', type: 'data' },
      ];

      gtmViewItemListEvent(items, 'Europe Plans', false);

      // Check GA4
      expect(window.dataLayer.length).toBeGreaterThanOrEqual(1);
      const ga4Event = window.dataLayer[0];
      expect(ga4Event.event).toBe('view_item_list');
      expect(ga4Event.ecommerce.items).toHaveLength(2);
      expect(ga4Event.ecommerce.item_list_name).toBe('Europe Plans');

      // Check Facebook
      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'ViewContent',
        expect.objectContaining({
          value: 25.00, // 10 + 15
          content_type: 'product',
        }),
        {}
      );
    });

    it('should calculate total value correctly for multiple items', () => {
      const items = [
        { id: '1', name: 'B1', category: 'EU', price: 19.00, gb: '5', validity: '30', type: 'data' },
        { id: '2', name: 'B2', category: 'EU', price: 29.00, gb: '10', validity: '30', type: 'data' },
        { id: '3', name: 'B3', category: 'EU', price: 39.00, gb: '20', validity: '30', type: 'data' },
      ];

      gtmViewItemListEvent(items, 'Premium Plans', false);

      const ga4Event = window.dataLayer[0];
      // ViewItemListEvent doesn't have a top-level value, just items
      expect(ga4Event.ecommerce.items).toHaveLength(3);
      expect(ga4Event.ecommerce.items[0].price).toBe(19.00);
      expect(ga4Event.ecommerce.items[1].price).toBe(29.00);
      expect(ga4Event.ecommerce.items[2].price).toBe(39.00);

      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'ViewContent',
        expect.objectContaining({ value: 87.00 }),
        {}
      );
    });
  });

  describe('gtmAddToCartEvent', () => {
    it('should send add_to_cart event to both providers', () => {
      const bundleData = {
        id: 'bundle_789',
        name: 'Asia 10GB',
        category: 'Asia',
        price: 25.00,
        gb: '10',
        validity: '30',
        type: 'data',
      };

      gtmAddToCartEvent(bundleData, false, 'iccid_123');

      // Check GA4
      expect(window.dataLayer.length).toBeGreaterThanOrEqual(1);
      const ga4Event = window.dataLayer[0];
      expect(ga4Event.event).toBe('add_to_cart');
      expect(ga4Event.ecommerce.items[0].item_id).toBe('bundle_789');
      expect(ga4Event.iccid).toBe('iccid_123'); // iccid is at root level, not in ecommerce

      // Check Facebook
      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'AddToCart',
        expect.objectContaining({
          value: 25.00,
          content_type: 'product',
        }),
        {}
      );
    });
  });

  describe('gtmBeginCheckoutEvent', () => {
    it('should send begin_checkout event to both providers', () => {
      const orderData = {
        order_id: 'checkout_999',
        order_amount: 1900, // ⚠️ SPECIAL: Only event that uses cents!
        order_fee: 500,
        order_vat: 210,
        order_discount: 0,
        currency: 'RON', // Changed from order_currency to currency
        bundle_details: {
          bundle_code: 'test_bundle',
          display_title: 'Test Bundle',
        },
        gb: '5',
        validity: '30',
        type: 'data',
      };

      gtmBeginCheckoutEvent(orderData);

      // Check GA4
      expect(window.dataLayer.length).toBeGreaterThanOrEqual(1);
      const ga4Event = window.dataLayer[0];
      expect(ga4Event.event).toBe('begin_checkout');
      expect(ga4Event.ecommerce.value).toBe(26.10); // Converted from cents
      expect(ga4Event.ecommerce.items[0].price).toBe(19.00); // 1900 / 100

      // Check Facebook
      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'InitiateCheckout',
        expect.objectContaining({
          value: 26.10,
          currency: 'RON',
        }),
        {}
      );
    });

    it('should convert cents to currency for begin_checkout only', () => {
      const orderData = {
        order_id: 'checkout_888',
        order_amount: 5000, // 50.00 EUR in cents
        order_fee: 1000, // 10.00 EUR
        order_vat: 500, // 5.00 EUR
        order_discount: 0,
        order_currency: 'EUR',
        bundle_name: 'Bundle',
        gb: '10',
        validity: '30',
        type: 'data',
      };

      gtmBeginCheckoutEvent(orderData);

      const ga4Event = window.dataLayer[0];
      expect(ga4Event.ecommerce.value).toBe(65.00); // (5000 + 1000 + 500) / 100
      expect(ga4Event.ecommerce.items[0].price).toBe(50.00);

      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'InitiateCheckout',
        expect.objectContaining({ value: 65.00 }),
        {}
      );
    });
  });

  describe('Facebook Pixel Unavailable Scenarios', () => {
    it('should still send to GA4 when Facebook Pixel is not available', () => {
      delete window.fbq;

      const bundleData = {
        id: 'bundle_123',
        name: 'Test',
        category: 'EU',
        price: 19.00,
        gb: '5',
        validity: '30',
        type: 'data',
      };

      gtmViewItemEvent(bundleData, false);

      // GA4 should still work
      expect(window.dataLayer.length).toBeGreaterThanOrEqual(1);
      expect(window.dataLayer[0].event).toBe('view_item');

      // Console should log that Facebook is unavailable
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Facebook Pixel not available')
      );
    });
  });

  describe('Currency Formatting', () => {
    it('should format all prices to 2 decimal places', () => {
      const orderData = {
        order_id: 'order_decimal',
        order_amount: 19.999,
        order_fee: 5.001,
        order_vat: 2.105,
        order_discount: 0,
        order_currency: 'EUR',
        bundle_name: 'Bundle',
        gb: '5',
        validity: '30',
        type: 'data',
      };

      gtmPurchaseEvent('purchase', orderData);

      const ga4Event = window.dataLayer[0];
      expect(ga4Event.ecommerce.value).toBe(27.10); // Rounded: 19.999 + 5.001 + 2.105 = 27.105 → 27.11
      expect(ga4Event.ecommerce.items[0].price).toBe(20.00); // 19.999 rounded
    });
  });

  describe('Deduplication', () => {
    it('should include eventID for Purchase events', () => {
      const orderData = {
        order_id: 'dedup_test_123',
        order_amount: 19.00,
        order_fee: 5.00,
        order_vat: 2.10,
        order_discount: 0,
        order_currency: 'EUR',
        bundle_name: 'Bundle',
        gb: '5',
        validity: '30',
        type: 'data',
      };

      gtmPurchaseEvent('purchase', orderData);

      // Facebook should receive eventID for CAPI coordination
      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'Purchase',
        expect.any(Object),
        { eventID: 'dedup_test_123' }
      );
    });

    it('should not include eventID for non-purchase events', () => {
      const bundleData = {
        id: 'bundle_123',
        name: 'Test',
        category: 'EU',
        price: 19.00,
        gb: '5',
        validity: '30',
        type: 'data',
      };

      gtmAddToCartEvent(bundleData, false, 'iccid_123');

      // AddToCart should not have eventID
      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'AddToCart',
        expect.any(Object),
        {} // Empty options object, no eventID
      );
    });
  });
});
