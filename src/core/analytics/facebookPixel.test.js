/**
 * Unit Tests for Facebook Pixel Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isFacebookPixelAvailable,
  sendFacebookPurchase,
  sendFacebookAddToCart,
  sendFacebookViewContent,
  sendFacebookInitiateCheckout,
  sendFacebookCustomEvent,
} from './facebookPixel';

describe('FacebookPixel', () => {
  beforeEach(() => {
    // Reset window.fbq before each test
    delete window.fbq;
  });

  describe('isFacebookPixelAvailable', () => {
    it('should return false when fbq is not defined', () => {
      expect(isFacebookPixelAvailable()).toBe(false);
    });

    it('should return true when fbq is defined', () => {
      window.fbq = vi.fn();
      expect(isFacebookPixelAvailable()).toBe(true);
    });

    it('should return false when fbq is not a function', () => {
      window.fbq = 'not a function';
      expect(isFacebookPixelAvailable()).toBe(false);
    });
  });

  describe('sendFacebookPurchase', () => {
    it('should not call fbq when pixel is not available', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      sendFacebookPurchase({ value: 100, currency: 'EUR' }, 'order_123');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Facebook Pixel not available')
      );
      consoleSpy.mockRestore();
    });

    it('should call fbq with Purchase event when pixel is available', () => {
      window.fbq = vi.fn();
      const params = {
        value: 100.50,
        currency: 'EUR',
        contents: [{ id: 'bundle_123', quantity: 1, item_price: 100.50 }],
      };

      sendFacebookPurchase(params, 'order_123');

      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'Purchase',
        expect.objectContaining({
          value: 100.50,
          currency: 'EUR',
        }),
        { eventID: 'order_123' }
      );
    });

    it('should sanitize array parameters to JSON strings', () => {
      window.fbq = vi.fn();
      const params = {
        value: 100,
        currency: 'EUR',
        contents: [
          { id: '1', quantity: 1, item_price: 50 },
          { id: '2', quantity: 1, item_price: 50 },
        ],
      };

      sendFacebookPurchase(params, 'order_123');

      const callArgs = window.fbq.mock.calls[0];
      expect(callArgs[0]).toBe('track');
      expect(callArgs[1]).toBe('Purchase');
      const sanitizedParams = callArgs[2];
      
      expect(typeof sanitizedParams.contents).toBe('string');
      expect(JSON.parse(sanitizedParams.contents)).toHaveLength(2);
    });
  });

  describe('sendFacebookAddToCart', () => {
    it('should call fbq with AddToCart event', () => {
      window.fbq = vi.fn();
      const params = {
        value: 19.99,
        currency: 'EUR',
        contents: [{ id: 'bundle_123', quantity: 1, item_price: 19.99 }],
      };

      sendFacebookAddToCart(params);

      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'AddToCart',
        expect.objectContaining({
          value: 19.99,
          currency: 'EUR',
        }),
        {}
      );
    });

    it('should not call fbq when pixel is not available', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      sendFacebookAddToCart({ value: 19.99 });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('sendFacebookViewContent', () => {
    it('should call fbq with ViewContent event', () => {
      window.fbq = vi.fn();
      const params = {
        value: 19.99,
        currency: 'EUR',
        contents: [{ id: 'bundle_123', quantity: 1, item_price: 19.99 }],
      };

      sendFacebookViewContent(params);

      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'ViewContent',
        expect.objectContaining({
          value: 19.99,
        }),
        {}
      );
    });
  });

  describe('sendFacebookInitiateCheckout', () => {
    it('should call fbq with InitiateCheckout event', () => {
      window.fbq = vi.fn();
      const params = {
        value: 26.10,
        currency: 'RON',
        num_items: 1,
        contents: [{ id: 'bundle_123', quantity: 1, item_price: 19.00 }],
      };

      sendFacebookInitiateCheckout(params);

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
  });

  describe('sendFacebookCustomEvent', () => {
    it('should call fbq trackCustom for custom events', () => {
      window.fbq = vi.fn();
      const params = {
        custom_param: 'test_value',
        numeric_param: 123,
      };

      sendFacebookCustomEvent('CustomEventName', params);

      expect(window.fbq).toHaveBeenCalledWith(
        'trackCustom',
        'CustomEventName',
        expect.objectContaining({
          custom_param: 'test_value',
          numeric_param: 123,
        })
      );
    });

    it('should not call fbq when pixel is not available', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      sendFacebookCustomEvent('Test', { param: 'value' });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Parameter Sanitization', () => {
    it('should convert objects to JSON strings', () => {
      window.fbq = vi.fn();
      const params = {
        value: 100,
        nested_object: { key1: 'value1', key2: 'value2' },
      };

      sendFacebookAddToCart(params);

      const callArgs = window.fbq.mock.calls[0];
      const sanitizedParams = callArgs[2]; // fbq('track', 'AddToCart', params, {})
      
      expect(typeof sanitizedParams.nested_object).toBe('string');
      expect(JSON.parse(sanitizedParams.nested_object)).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should keep primitive types as-is', () => {
      window.fbq = vi.fn();
      const params = {
        string_val: 'test',
        number_val: 123,
        boolean_val: true,
      };

      sendFacebookAddToCart(params);

      const callArgs = window.fbq.mock.calls[0];
      const sanitizedParams = callArgs[2]; // fbq('track', 'AddToCart', params, {})
      
      expect(sanitizedParams.string_val).toBe('test');
      expect(sanitizedParams.number_val).toBe(123);
      expect(sanitizedParams.boolean_val).toBe(true);
    });

    it('should skip null and undefined values', () => {
      window.fbq = vi.fn();
      const params = {
        value: 100,
        null_val: null,
        undefined_val: undefined,
        valid_val: 'test',
      };

      sendFacebookAddToCart(params);

      const callArgs = window.fbq.mock.calls[0];
      const sanitizedParams = callArgs[2]; // fbq('track', 'AddToCart', params, {})
      
      expect(sanitizedParams).not.toHaveProperty('null_val');
      expect(sanitizedParams).not.toHaveProperty('undefined_val');
      expect(sanitizedParams).toHaveProperty('valid_val');
    });

    it('should handle complex nested structures', () => {
      window.fbq = vi.fn();
      const params = {
        value: 100,
        contents: [
          {
            id: 'item_1',
            properties: { color: 'red', size: 'large' },
            tags: ['sale', 'new'],
          },
        ],
      };

      sendFacebookAddToCart(params);

      const callArgs = window.fbq.mock.calls[0];
      const sanitizedParams = callArgs[2]; // fbq('track', 'AddToCart', params, {})
      
      expect(typeof sanitizedParams.contents).toBe('string');
      const parsed = JSON.parse(sanitizedParams.contents);
      expect(parsed[0].id).toBe('item_1');
      expect(parsed[0].properties).toEqual({ color: 'red', size: 'large' });
    });
  });

  describe('Error Handling', () => {
    it('should catch and log errors during event sending', () => {
      window.fbq = vi.fn(() => {
        throw new Error('Pixel error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      sendFacebookAddToCart({ value: 100 });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error sending Facebook Pixel event'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it('should not throw error when pixel throws', () => {
      window.fbq = vi.fn(() => {
        throw new Error('Pixel error');
      });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        sendFacebookAddToCart({ value: 100 });
      }).not.toThrow();
    });
  });
});
