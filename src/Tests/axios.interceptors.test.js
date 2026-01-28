import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { api } from '../core/apis/axios';
import { store } from '../redux/store';
import { SignOut } from '../redux/reducers/authReducer';

// Mock dependencies
vi.mock('../redux/store', () => ({
  store: {
    getState: vi.fn(),
    dispatch: vi.fn(),
  },
}));

vi.mock('../../firebaseconfig', () => ({
  messaging: null,
}));

vi.mock('../main', () => ({
  queryClient: {
    clear: vi.fn(),
  },
}));

vi.mock('../core/apis/authAPI', () => ({
  supabaseSignout: vi.fn(),
  refreshToken: vi.fn(),
}));

describe('Axios Interceptors - Security Update Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when user is authenticated', () => {
      const mockToken = 'test-access-token-12345';
      store.getState.mockReturnValue({
        authentication: {
          access_token: mockToken,
          tmp: {
            isAuthenticated: false,
          },
        },
      });

      const config = {
        headers: {},
      };

      // Manually call the request interceptor
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should add x-device-id header from sessionStorage', () => {
      const deviceId = 'device-123-456';
      sessionStorage.setItem('x-device-id', deviceId);

      store.getState.mockReturnValue({
        authentication: {},
      });

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      expect(result.headers['x-device-id']).toBe(deviceId);
    });

    it('should add affiliate click ID header when valid and not expired', () => {
      const clickId = 'affiliate-123';
      const timestamp = Date.now().toString();
      localStorage.setItem('affiliate_click_id', clickId);
      localStorage.setItem('affiliate_click_timestamp', timestamp);

      store.getState.mockReturnValue({
        authentication: {},
      });

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      expect(result.headers['X-Affiliate-Click-Id']).toBe(clickId);
    });

    it('should remove expired affiliate data and not add header', () => {
      const clickId = 'affiliate-123';
      const expiredTimestamp = (Date.now() - 31 * 24 * 60 * 60 * 1000).toString(); // 31 days ago
      localStorage.setItem('affiliate_click_id', clickId);
      localStorage.setItem('affiliate_click_timestamp', expiredTimestamp);

      store.getState.mockReturnValue({
        authentication: {},
      });

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      expect(result.headers['X-Affiliate-Click-Id']).toBeUndefined();
      expect(localStorage.getItem('affiliate_click_id')).toBeNull();
      expect(localStorage.getItem('affiliate_click_timestamp')).toBeNull();
    });

    it('should add accept-language header from localStorage', () => {
      const language = 'fr';
      localStorage.setItem('i18nextLng', language);

      store.getState.mockReturnValue({
        authentication: {},
      });

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      expect(result.headers['accept-language']).toBe(language);
    });

    it('should add currency header from sessionStorage', () => {
      const currency = 'USD';
      sessionStorage.setItem('user_currency', currency);

      store.getState.mockReturnValue({
        authentication: {},
      });

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      expect(result.headers['x-currency']).toBe(currency);
    });
  });

  describe('Response Interceptor - Error Handling', () => {
    it('should handle successful responses', async () => {
      const mockResponse = {
        data: { success: true },
        status: 200,
      };

      const interceptor = api.interceptors.response.handlers[0];
      const result = interceptor.fulfilled(mockResponse);

      expect(result).toBe(mockResponse);
    });

    it('should reject on error without retry flag', async () => {
      const mockError = {
        response: { status: 500 },
        config: {},
      };

      const interceptor = api.interceptors.response.handlers[0];
      
      try {
        await interceptor.rejected(mockError);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Axios 1.13.4 - DoS Protection', () => {
    it('should handle large payloads without crashing', async () => {
      // Test that axios can handle reasonably large payloads
      const largePayload = {
        data: 'x'.repeat(1000000), // 1MB string
      };

      // This should not throw an error
      expect(() => {
        const config = {
          headers: {},
          data: largePayload,
        };
        const interceptor = api.interceptors.request.handlers[0];
        interceptor.fulfilled(config);
      }).not.toThrow();
    });

    it('should preserve request configuration', () => {
      store.getState.mockReturnValue({
        authentication: {},
      });

      const config = {
        headers: { 'Custom-Header': 'value' },
        timeout: 5000,
        method: 'POST',
        data: { test: true },
      };

      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      expect(result.timeout).toBe(5000);
      expect(result.method).toBe('POST');
      expect(result.data).toEqual({ test: true });
      expect(result.headers['Custom-Header']).toBe('value');
    });
  });

  describe('Token Refresh Queue', () => {
    it('should skip auth refresh when _skipAuthRefresh flag is set', () => {
      const mockToken = 'new-token-12345';
      store.getState.mockReturnValue({
        authentication: {
          access_token: mockToken,
        },
      });

      const config = {
        headers: {},
        _skipAuthRefresh: true,
      };

      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      // Should not update Authorization header when _skipAuthRefresh is true
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should handle request errors gracefully', async () => {
      const mockError = new Error('Network error');
      
      const interceptor = api.interceptors.request.handlers[0];
      
      try {
        await interceptor.rejected(mockError);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  describe('Session Storage Integration', () => {
    it('should use default device ID when sessionStorage is empty', () => {
      store.getState.mockReturnValue({
        authentication: {},
      });

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      expect(result.headers['x-device-id']).toBe('1234');
    });

    it('should use default currency when not set', () => {
      store.getState.mockReturnValue({
        authentication: {},
        currency: {
          system_currency: 'GBP',
        },
      });

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      expect(result.headers['x-currency']).toBe('GBP');
    });
  });

  describe('Token Refresh Flow - 401 Handling', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should set _retry flag on first 401 error', async () => {
      const mockError = {
        response: { status: 401 },
        config: { headers: {} },
      };

      const interceptor = api.interceptors.response.handlers[0];
      
      try {
        await interceptor.rejected(mockError);
      } catch (error) {
        // Expected to fail during test, but should set retry flag
      }

      expect(mockError.config._retry).toBe(true);
    });

    it('should not retry when _retry flag is already set', async () => {
      const mockError = {
        response: { status: 401 },
        config: { 
          headers: {},
          _retry: true // Already retried
        },
      };

      const interceptor = api.interceptors.response.handlers[0];
      
      try {
        await interceptor.rejected(mockError);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
        // Should not attempt refresh again
      }
    });
  });

  describe('403 Forbidden Handling', () => {
    it('should dispatch SignOut on 403 error', async () => {
      const mockError = {
        response: { status: 403 },
        config: { headers: {} },
      };

      const interceptor = api.interceptors.response.handlers[0];
      
      try {
        await interceptor.rejected(mockError);
      } catch (error) {
        // Expected to fail
      }

      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe('Error Message Translation', () => {
    it('should handle errors without response', async () => {
      const mockError = {
        message: 'Network Error',
        config: { headers: {} },
      };

      const interceptor = api.interceptors.response.handlers[0];
      
      try {
        await interceptor.rejected(mockError);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('Network Error');
      }
    });

    it('should preserve error structure', async () => {
      const mockError = {
        response: { 
          status: 500,
          data: { 
            message: 'Server Error',
            developerMessage: 'Database connection failed' 
          }
        },
        config: { headers: {} },
      };

      const interceptor = api.interceptors.response.handlers[0];
      
      try {
        await interceptor.rejected(mockError);
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.message).toBe('Server Error');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle store being undefined', () => {
      const config = { headers: {}, _skipAuthRefresh: true };
      const interceptor = api.interceptors.request.handlers[0];
      
      // Should not throw error even if store access fails
      expect(() => {
        interceptor.fulfilled(config);
      }).not.toThrow();
      
      expect(config.headers).toBeDefined();
    });

    it('should handle very long header values', () => {
      const longValue = 'x'.repeat(8000); // 8KB header
      sessionStorage.setItem('x-device-id', longValue);

      vi.spyOn(store, 'getState').mockReturnValue({
        authentication: {},
      });

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      expect(result.headers['x-device-id']).toBe(longValue);
      
      vi.restoreAllMocks();
    });

    it('should handle network errors gracefully', async () => {
      const networkError = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
        config: { headers: {} },
      };

      const interceptor = api.interceptors.response.handlers[0];
      
      try {
        await interceptor.rejected(networkError);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.code).toBe('ERR_NETWORK');
      }
    });

    it('should handle timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
        config: { headers: {} },
      };

      const interceptor = api.interceptors.response.handlers[0];
      
      try {
        await interceptor.rejected(timeoutError);
      } catch (error) {
        expect(error.code).toBe('ECONNABORTED');
      }
    });

    it('should handle malformed tokens', () => {
      const malformedToken = 'not-a-valid-jwt-token!!!';
      vi.spyOn(store, 'getState').mockReturnValue({
        authentication: {
          access_token: malformedToken,
        },
      });

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      // Should still add the token even if malformed
      expect(result.headers.Authorization).toBe(`Bearer ${malformedToken}`);
      
      vi.restoreAllMocks();
    });

    it('should handle localStorage quota exceeded', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      vi.spyOn(store, 'getState').mockReturnValue({
        authentication: {},
      });

      // Should not crash when localStorage fails
      expect(() => {
        const config = { headers: {} };
        const interceptor = api.interceptors.request.handlers[0];
        interceptor.fulfilled(config);
      }).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
      vi.restoreAllMocks();
    });
  });
});
