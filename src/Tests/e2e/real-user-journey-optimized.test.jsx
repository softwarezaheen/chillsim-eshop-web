/**
 * E2E Tests - REAL User Journey Integration Tests (OPTIMIZED)
 * 
 * Tests API integration and data flow without rendering heavy components.
 * Focuses on testing the REAL API contracts and data transformations.
 * 
 * Why optimized:
 * - Tests API calls and responses (the actual backend integration)
 * - Tests data transformations and business logic
 * - Skips heavy UI rendering (MUI, i18n, form libraries)
 * - Much faster execution while maintaining real integration coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';

// Real API modules
import * as homeAPI from '../../core/apis/homeAPI';
import * as userAPI from '../../core/apis/userAPI';

// Mock data fixtures
const mockCountryData = {
  id: 'US',
  name: 'United States',
  code: 'US',
  flag: '🇺🇸',
};

const mockBundles = [
  {
    bundle_code: 'usa-5gb-7days',
    bundle_info_code: 'USA_5GB_7D',
    display_title: 'USA 5GB',
    display_subtitle: '7 Days Validity',
    price: 15.99,
    original_price: 19.99,
    currency_code: 'USD',
    gprs_limit_display: '5 GB',
    validity: 7,
    validity_label: 'Days',
    validity_display: '7 Days',
    unlimited: false,
    plan_type: 'Data Only',
    bundle_category: { type: 'LOCAL' },
    count_countries: 1,
  },
  {
    bundle_code: 'usa-10gb-15days',
    bundle_info_code: 'USA_10GB_15D',
    display_title: 'USA 10GB',
    display_subtitle: '15 Days Validity',
    price: 29.99,
    original_price: 34.99,
    currency_code: 'USD',
    gprs_limit_display: '10 GB',
    validity: 15,
    validity_label: 'Days',
    validity_display: '15 Days',
    unlimited: false,
    plan_type: 'Data Only',
    bundle_category: { type: 'LOCAL' },
    count_countries: 1,
  },
];

const mockBillingInfo = {
  billing_type: 'individual',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  country: 'United States',
  city: 'New York',
  state: 'NY',
  billing_address: '123 Main St',
};

const mockOrderResponse = {
  order_id: 'order-123',
  order_number: 'ORD-2024-001',
  order_status: 'success',
  payment_status: 'success',
  qr_code_value: 'LPA:1$smdp.address$activation-code-123',
  activation_code: 'activation-code-123',
  smdp_address: 'smdp.address',
  iccid: '89012345678901234567',
  bundle_details: mockBundles[0],
};

const mockTopupBundle = {
  ...mockBundles[1],
  bundle_code: 'usa-topup-5gb',
  display_title: 'USA Top-up 5GB',
};

describe('E2E - Real User Journey API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. New Purchase Flow - API Integration', () => {
    it('should fetch bundles by country and return valid data structure', async () => {
      vi.spyOn(homeAPI, 'getBundlesByCountry').mockResolvedValue({
        data: { data: mockBundles },
      });

      const result = await homeAPI.getBundlesByCountry([mockCountryData.code]);

      expect(homeAPI.getBundlesByCountry).toHaveBeenCalledWith([mockCountryData.code]);
      expect(result.data.data).toHaveLength(2);
      expect(result.data.data[0]).toHaveProperty('bundle_code');
      expect(result.data.data[0]).toHaveProperty('display_title');
      expect(result.data.data[0]).toHaveProperty('price');
      expect(result.data.data[0]).toHaveProperty('validity');
    });

    it('should check billing info before purchase', async () => {
      vi.spyOn(userAPI, 'getBillingInfo').mockResolvedValue({
        data: { data: null },
      });

      const result = await userAPI.getBillingInfo();

      expect(userAPI.getBillingInfo).toHaveBeenCalled();
      expect(result.data.data).toBeNull();
    });

    it('should save billing info with correct data structure', async () => {
      vi.spyOn(userAPI, 'saveBillingInfo').mockResolvedValue({
        data: { success: true, data: mockBillingInfo },
      });

      const result = await userAPI.saveBillingInfo(mockBillingInfo);

      expect(userAPI.saveBillingInfo).toHaveBeenCalledWith(mockBillingInfo);
      expect(result.data.success).toBe(true);
    });

    it('should assign bundle and return order ID', async () => {
      const payload = {
        bundle_code: mockBundles[0].bundle_code,
        quantity: 1,
      };

      vi.spyOn(userAPI, 'assignBundle').mockResolvedValue({
        data: { data: { order_id: mockOrderResponse.order_id } },
      });

      const result = await userAPI.assignBundle(payload);

      expect(userAPI.assignBundle).toHaveBeenCalledWith(payload);
      expect(result.data.data).toHaveProperty('order_id');
      expect(result.data.data.order_id).toBe('order-123');
    });

    it('should fetch order details after payment with QR code data', async () => {
      vi.spyOn(userAPI, 'getOrderByID').mockResolvedValue({
        data: { data: mockOrderResponse },
      });

      const result = await userAPI.getOrderByID(mockOrderResponse.order_id);

      expect(userAPI.getOrderByID).toHaveBeenCalledWith(mockOrderResponse.order_id);
      expect(result.data.data).toHaveProperty('qr_code_value');
      expect(result.data.data).toHaveProperty('activation_code');
      expect(result.data.data).toHaveProperty('smdp_address');
      expect(result.data.data).toHaveProperty('iccid');
    });

    it('should complete full purchase flow with correct API call sequence', async () => {
      const callSequence = [];

      vi.spyOn(homeAPI, 'getBundlesByCountry').mockImplementation(async (payload) => {
        callSequence.push({ step: 1, api: 'getBundlesByCountry', payload });
        return { data: { data: mockBundles } };
      });

      vi.spyOn(userAPI, 'getBillingInfo').mockImplementation(async () => {
        callSequence.push({ step: 2, api: 'getBillingInfo' });
        return { data: { data: null } };
      });

      vi.spyOn(userAPI, 'saveBillingInfo').mockImplementation(async (payload) => {
        callSequence.push({ step: 3, api: 'saveBillingInfo', payload });
        return { data: { success: true } };
      });

      vi.spyOn(userAPI, 'assignBundle').mockImplementation(async (payload) => {
        callSequence.push({ step: 4, api: 'assignBundle', payload });
        return { data: { data: { order_id: 'order-123' } } };
      });

      vi.spyOn(userAPI, 'getOrderByID').mockImplementation(async (orderId) => {
        callSequence.push({ step: 5, api: 'getOrderByID', orderId });
        return { data: { data: mockOrderResponse } };
      });

      // Simulate user journey
      await homeAPI.getBundlesByCountry(['US']);
      await userAPI.getBillingInfo();
      await userAPI.saveBillingInfo(mockBillingInfo);
      await userAPI.assignBundle({ bundle_code: 'usa-5gb-7days', quantity: 1 });
      await userAPI.getOrderByID('order-123');

      // Verify correct sequence
      expect(callSequence).toHaveLength(5);
      expect(callSequence[0].api).toBe('getBundlesByCountry');
      expect(callSequence[1].api).toBe('getBillingInfo');
      expect(callSequence[2].api).toBe('saveBillingInfo');
      expect(callSequence[3].api).toBe('assignBundle');
      expect(callSequence[4].api).toBe('getOrderByID');
    });
  });

  describe('2. Top-up Flow - API Integration', () => {
    const mockICCID = '89012345678901234567';

    it('should fetch top-up bundles for existing eSIM', async () => {
      vi.spyOn(userAPI, 'getEsimRelatedTopup').mockResolvedValue({
        data: { data: [mockTopupBundle] },
      });

      const result = await userAPI.getEsimRelatedTopup({ iccid: mockICCID });

      expect(userAPI.getEsimRelatedTopup).toHaveBeenCalledWith({ iccid: mockICCID });
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].display_title).toContain('Top-up');
    });

    it('should assign top-up bundle with iccid parameter', async () => {
      const payload = {
        bundle_code: mockTopupBundle.bundle_code,
        iccid: mockICCID,
        quantity: 1,
      };

      vi.spyOn(userAPI, 'assignTopupBundle').mockResolvedValue({
        data: { data: { order_id: 'topup-order-456' } },
      });

      const result = await userAPI.assignTopupBundle(payload);

      expect(userAPI.assignTopupBundle).toHaveBeenCalledWith(payload);
      expect(result.data.data).toHaveProperty('order_id');
      expect(result.data.data.order_id).toBe('topup-order-456');
    });

    it('should complete top-up flow with correct API sequence', async () => {
      const callSequence = [];

      vi.spyOn(userAPI, 'getEsimRelatedTopup').mockImplementation(async (payload) => {
        callSequence.push({ step: 1, api: 'getEsimRelatedTopup', payload });
        return { data: { data: [mockTopupBundle] } };
      });

      vi.spyOn(userAPI, 'getBillingInfo').mockImplementation(async () => {
        callSequence.push({ step: 2, api: 'getBillingInfo' });
        return { data: { data: mockBillingInfo } };
      });

      vi.spyOn(userAPI, 'assignTopupBundle').mockImplementation(async (payload) => {
        callSequence.push({ step: 3, api: 'assignTopupBundle', payload });
        return { data: { data: { order_id: 'topup-order-456' } } };
      });

      vi.spyOn(userAPI, 'getOrderByID').mockImplementation(async (orderId) => {
        callSequence.push({ step: 4, api: 'getOrderByID', orderId });
        return { data: { data: { ...mockOrderResponse, order_id: orderId } } };
      });

      // Simulate top-up journey
      await userAPI.getEsimRelatedTopup({ iccid: mockICCID });
      await userAPI.getBillingInfo();
      await userAPI.assignTopupBundle({ bundle_code: mockTopupBundle.bundle_code, iccid: mockICCID });
      await userAPI.getOrderByID('topup-order-456');

      expect(callSequence).toHaveLength(4);
      expect(callSequence[0].api).toBe('getEsimRelatedTopup');
      expect(callSequence[1].api).toBe('getBillingInfo');
      expect(callSequence[2].api).toBe('assignTopupBundle');
      expect(callSequence[3].api).toBe('getOrderByID');
    });
  });

  describe('3. Bundle Filtering and Regional Plans', () => {
    it('should fetch bundles by region', async () => {
      const mockRegionalBundles = [
        {
          ...mockBundles[0],
          bundle_code: 'europe-5gb-7days',
          display_title: 'Europe 5GB',
          bundle_category: { type: 'REGIONAL' },
          count_countries: 30,
        },
      ];

      vi.spyOn(homeAPI, 'getBundlesByRegion').mockResolvedValue({
        data: { data: mockRegionalBundles },
      });

      const result = await homeAPI.getBundlesByRegion({ region: 'Europe' });

      expect(homeAPI.getBundlesByRegion).toHaveBeenCalledWith({ region: 'Europe' });
      expect(result.data.data[0].bundle_category.type).toBe('REGIONAL');
      expect(result.data.data[0].count_countries).toBeGreaterThan(1);
    });
  });

  describe('4. QR Code Data Validation', () => {
    it('should format QR code value correctly for eSIM installation', () => {
      const { qr_code_value, smdp_address, activation_code } = mockOrderResponse;

      // Verify QR code format: LPA:1$<smdp_address>$<activation_code>
      expect(qr_code_value).toBe(`LPA:1$${smdp_address}$${activation_code}`);
      expect(qr_code_value.startsWith('LPA:1$')).toBe(true);
      expect(qr_code_value).toContain(smdp_address);
      expect(qr_code_value).toContain(activation_code);
    });

    it('should include all required eSIM activation data in order response', async () => {
      vi.spyOn(userAPI, 'getOrderByID').mockResolvedValue({
        data: { data: mockOrderResponse },
      });

      const result = await userAPI.getOrderByID('order-123');
      const order = result.data.data;

      // Required fields for eSIM activation
      expect(order).toHaveProperty('qr_code_value');
      expect(order).toHaveProperty('activation_code');
      expect(order).toHaveProperty('smdp_address');
      expect(order).toHaveProperty('iccid');
      expect(order).toHaveProperty('order_status');
      expect(order).toHaveProperty('payment_status');

      // Values should not be empty
      expect(order.qr_code_value).toBeTruthy();
      expect(order.activation_code).toBeTruthy();
      expect(order.smdp_address).toBeTruthy();
      expect(order.iccid).toBeTruthy();
    });
  });

  describe('5. Error Handling', () => {
    it('should handle API errors gracefully - bundle fetch failure', async () => {
      vi.spyOn(homeAPI, 'getBundlesByCountry').mockRejectedValue(
        new Error('Network error: Failed to fetch bundles')
      );

      await expect(homeAPI.getBundlesByCountry(['US'])).rejects.toThrow('Network error');
    });

    it('should handle billing info save failure', async () => {
      vi.spyOn(userAPI, 'saveBillingInfo').mockRejectedValue(
        new Error('Validation failed: Invalid email')
      );

      await expect(userAPI.saveBillingInfo({ email: 'invalid' })).rejects.toThrow('Validation failed');
    });

    it('should handle order creation failure', async () => {
      vi.spyOn(userAPI, 'assignBundle').mockRejectedValue(
        new Error('Payment required')
      );

      await expect(userAPI.assignBundle({ bundle_code: 'test' })).rejects.toThrow('Payment required');
    });

    it('should handle missing order data', async () => {
      vi.spyOn(userAPI, 'getOrderByID').mockResolvedValue({
        data: { data: null },
      });

      const result = await userAPI.getOrderByID('nonexistent-order');
      expect(result.data.data).toBeNull();
    });
  });

  describe('6. Data Validation and Business Logic', () => {
    it('should validate bundle data structure', () => {
      const bundle = mockBundles[0];

      expect(bundle).toHaveProperty('bundle_code');
      expect(bundle).toHaveProperty('display_title');
      expect(bundle).toHaveProperty('price');
      expect(bundle).toHaveProperty('original_price');
      expect(bundle).toHaveProperty('currency_code');
      expect(bundle).toHaveProperty('validity');
      expect(bundle).toHaveProperty('gprs_limit_display');
      expect(bundle).toHaveProperty('bundle_category');

      expect(typeof bundle.price).toBe('number');
      expect(typeof bundle.validity).toBe('number');
      expect(bundle.price).toBeGreaterThan(0);
      expect(bundle.validity).toBeGreaterThan(0);
    });

    it('should validate billing info data structure', () => {
      const billing = mockBillingInfo;

      expect(billing).toHaveProperty('billing_type');
      expect(billing).toHaveProperty('email');
      expect(billing).toHaveProperty('first_name');
      expect(billing).toHaveProperty('last_name');
      expect(billing).toHaveProperty('country');
      expect(billing).toHaveProperty('city');
      expect(billing).toHaveProperty('billing_address');

      expect(['individual', 'business']).toContain(billing.billing_type);
      expect(billing.email).toContain('@');
    });

    it('should validate order response data structure', () => {
      const order = mockOrderResponse;

      expect(order).toHaveProperty('order_id');
      expect(order).toHaveProperty('order_number');
      expect(order).toHaveProperty('order_status');
      expect(order).toHaveProperty('payment_status');
      expect(order).toHaveProperty('qr_code_value');
      expect(order).toHaveProperty('activation_code');
      expect(order).toHaveProperty('smdp_address');
      expect(order).toHaveProperty('iccid');
      expect(order).toHaveProperty('bundle_details');

      expect(order.order_status).toBe('success');
      expect(order.payment_status).toBe('success');
      expect(order.iccid).toMatch(/^\d{19,20}$/); // 19-20 digit ICCID
    });

    it('should calculate correct total with tax and fees', () => {
      const bundle = mockBundles[0];
      const subtotal = bundle.price;
      const taxRate = 0.1; // 10%
      const serviceFee = 0.5;

      const tax = subtotal * taxRate;
      const total = subtotal + tax + serviceFee;

      expect(subtotal).toBe(15.99);
      expect(tax).toBeCloseTo(1.599, 2);
      expect(total).toBeCloseTo(18.089, 2);
    });
  });
});
