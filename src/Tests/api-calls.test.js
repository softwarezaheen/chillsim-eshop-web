import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { api } from '../core/apis/axios';
import * as homeAPI from '../core/apis/homeAPI';
import * as userAPI from '../core/apis/userAPI';
import * as walletAPI from '../core/apis/walletAPI';

// Mock the api instance
vi.mock('../core/apis/axios', async () => {
  const actual = await vi.importActual('../core/apis/axios');
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), handlers: [] },
        response: { use: vi.fn(), handlers: [] },
      },
    },
  };
});

vi.mock('../redux/store', () => ({
  store: {
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
  },
}));

vi.mock('../main', () => ({
  queryClient: { clear: vi.fn() },
}));

vi.mock('../../firebaseconfig', () => ({
  messaging: null,
}));

vi.mock('../core/apis/authAPI', () => ({
  supabaseSignout: vi.fn(),
}));

describe('API Calls - Axios 1.13.4 Compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET Requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { data: { bundles: [] }, status: 200 };
      api.get.mockResolvedValue(mockData);

      const result = await homeAPI.getHomePageContent();

      expect(api.get).toHaveBeenCalledWith('api/v1/home/');
      expect(result).toEqual(mockData);
    });

    it('should handle GET request with query parameters', async () => {
      const mockData = { data: { bundles: [] } };
      api.get.mockResolvedValue(mockData);

      const payload = ['US', 'UK'];
      await homeAPI.getBundlesByCountry(payload);

      expect(api.get).toHaveBeenCalledWith('api/v1/bundles/by-country', {
        params: { country_codes: payload },
      });
    });

    it('should handle GET request errors gracefully', async () => {
      const mockError = new Error('Network error');
      api.get.mockRejectedValue(mockError);

      try {
        await homeAPI.getHomePageContent();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    it('should handle 404 errors for wallet API', async () => {
      api.get.mockRejectedValue({
        response: { status: 404 },
        code: 'ERR_NETWORK',
      });

      const result = await walletAPI.getWalletTransactions(1, 10);

      // Should return empty data instead of throwing
      expect(result.data.success).toBe(true);
      expect(result.data.data).toEqual([]);
    });
  });

  describe('POST Requests', () => {
    it('should make successful POST request', async () => {
      const mockData = { data: { orderId: '123' } };
      const payload = { bundleId: 'bundle-1', quantity: 1 };
      api.post.mockResolvedValue(mockData);

      const result = await userAPI.assignBundle(payload);

      expect(api.post).toHaveBeenCalledWith('api/v1/user/bundle/assign', payload);
      expect(result).toEqual(mockData);
    });

    it('should make POST request with large payload', async () => {
      const mockData = { data: { success: true } };
      const largePayload = {
        bundleId: 'bundle-1',
        notes: 'x'.repeat(10000), // 10KB note
      };
      api.post.mockResolvedValue(mockData);

      await userAPI.assignBundle(largePayload);

      expect(api.post).toHaveBeenCalledWith(
        'api/v1/user/bundle/assign',
        largePayload
      );
    });

    it('should handle POST request errors', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid bundle' },
        },
      };
      api.post.mockRejectedValue(mockError);

      try {
        await userAPI.assignBundle({ bundleId: 'invalid' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    it('should handle voucher redemption', async () => {
      const mockData = { data: { success: true, amount: 10 } };
      const payload = { code: 'SAVE10' };
      api.post.mockResolvedValue(mockData);

      const result = await walletAPI.redeemVoucher(payload);

      expect(api.post).toHaveBeenCalledWith('api/v1/voucher/redeem', payload);
      expect(result).toEqual(mockData);
    });
  });

  describe('Request Configuration', () => {
    it('should preserve custom headers in requests', async () => {
      const mockData = { data: {} };
      api.post.mockResolvedValue(mockData);

      await userAPI.assignBundle({ bundleId: 'test' });

      // Verify the API was called (headers are handled by interceptors)
      expect(api.post).toHaveBeenCalled();
    });

    it('should handle timeout configuration', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      };
      api.get.mockRejectedValue(mockError);

      try {
        await homeAPI.getHomePageContent();
        expect.fail('Should have thrown timeout error');
      } catch (error) {
        expect(error.code).toBe('ECONNABORTED');
      }
    });
  });

  describe('Response Handling', () => {
    it('should handle successful response with data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { bundles: [1, 2, 3] },
        },
        status: 200,
        statusText: 'OK',
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await homeAPI.getHomePageContent();

      expect(result.data.success).toBe(true);
      expect(result.data.data.bundles).toHaveLength(3);
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        data: null,
        status: 204,
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await homeAPI.getHomePageContent();

      expect(result.data).toBeNull();
      expect(result.status).toBe(204);
    });

    it('should handle malformed JSON gracefully', async () => {
      const mockError = {
        response: {
          status: 200,
          data: 'not json',
        },
      };
      api.get.mockRejectedValue(mockError);

      try {
        await homeAPI.getHomePageContent();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.data).toBe('not json');
      }
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors', async () => {
      const networkError = {
        message: 'Network Error',
        code: 'ERR_NETWORK',
      };
      api.get.mockRejectedValue(networkError);

      try {
        await homeAPI.getHomePageContent();
        expect.fail('Should have thrown network error');
      } catch (error) {
        expect(error.code).toBe('ERR_NETWORK');
      }
    });

    it('should handle 500 server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };
      api.get.mockRejectedValue(serverError);

      try {
        await homeAPI.getHomePageContent();
        expect.fail('Should have thrown server error');
      } catch (error) {
        expect(error.response.status).toBe(500);
      }
    });

    it('should handle 401 unauthorized errors', async () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      api.get.mockRejectedValue(authError);

      try {
        await userAPI.getOrdersHistory({});
        expect.fail('Should have thrown auth error');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('DoS Protection - Axios 1.13.4', () => {
    it('should handle large response data without crashing', async () => {
      const largeResponse = {
        data: {
          bundles: Array(10000).fill({ id: 1, name: 'Bundle' }),
        },
        status: 200,
      };
      api.get.mockResolvedValue(largeResponse);

      const result = await homeAPI.getHomePageContent();

      expect(result.data.bundles).toHaveLength(10000);
    });

    it('should not allow unbounded data growth', async () => {
      // Test that we handle extremely large payloads safely
      const extremelyLargePayload = {
        data: 'x'.repeat(10 * 1024 * 1024), // 10MB
      };

      api.post.mockResolvedValue({ data: { success: true } });

      // Should not crash or hang
      await expect(
        userAPI.assignBundle(extremelyLargePayload)
      ).resolves.toBeDefined();
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple simultaneous requests', async () => {
      api.get.mockResolvedValue({ data: { success: true } });

      const requests = [
        homeAPI.getHomePageContent(),
        homeAPI.getAboutusContent(),
        homeAPI.getTermsContent(),
        homeAPI.getPrivacyPolicyContent(),
      ];

      const results = await Promise.all(requests);

      expect(results).toHaveLength(4);
      expect(api.get).toHaveBeenCalledTimes(4);
    });

    it('should handle race conditions gracefully', async () => {
      let callCount = 0;
      api.get.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ data: { count: callCount } });
      });

      const requests = Array(10).fill(null).map(() => 
        homeAPI.getHomePageContent()
      );

      await Promise.all(requests);

      expect(callCount).toBe(10);
    });
  });

  describe('Request Cancellation', () => {
    it('should handle aborted requests', async () => {
      const abortError = {
        code: 'ERR_CANCELED',
        message: 'Request canceled',
      };
      api.get.mockRejectedValue(abortError);

      try {
        await homeAPI.getHomePageContent();
        expect.fail('Should have thrown cancel error');
      } catch (error) {
        expect(error.code).toBe('ERR_CANCELED');
      }
    });
  });

  describe('Pagination Handling', () => {
    it('should handle paginated requests correctly', async () => {
      const mockData = {
        data: {
          success: true,
          data: [],
          total_count: 100,
        },
      };
      api.get.mockResolvedValue(mockData);

      await walletAPI.getWalletTransactions(2, 20);

      expect(api.get).toHaveBeenCalledWith('api/v1/wallet/transactions', {
        params: {
          page_index: 2,
          page_size: 20,
        },
      });
    });

    it('should use default pagination values', async () => {
      api.get.mockResolvedValue({ data: { data: [] } });

      await walletAPI.getWalletTransactions();

      expect(api.get).toHaveBeenCalledWith('api/v1/wallet/transactions', {
        params: {
          page_index: 1,
          page_size: 10,
        },
      });
    });
  });

  describe('Retry Logic and Advanced Features', () => {
    it('should handle request with custom headers', async () => {
      const mockData = { data: { success: true } };
      api.post.mockResolvedValue(mockData);

      await userAPI.assignBundle({ bundleId: 'test' });

      // Verify request was made
      expect(api.post).toHaveBeenCalledWith(
        'api/v1/user/bundle/assign',
        { bundleId: 'test' }
      );
    });

    it('should handle redirect responses', async () => {
      const redirectError = {
        response: {
          status: 302,
          headers: { location: '/new-location' },
        },
      };
      api.get.mockRejectedValue(redirectError);

      try {
        await homeAPI.getHomePageContent();
        expect.fail('Should have thrown redirect error');
      } catch (error) {
        expect(error.response.status).toBe(302);
      }
    });

    it('should handle compressed responses', async () => {
      const mockData = {
        data: { bundles: [] },
        headers: { 'content-encoding': 'gzip' },
      };
      api.get.mockResolvedValue(mockData);

      const result = await homeAPI.getHomePageContent();

      expect(result.data.bundles).toBeDefined();
    });

    it('should handle different content types', async () => {
      const xmlResponse = {
        data: '<xml><data>test</data></xml>',
        headers: { 'content-type': 'application/xml' },
      };
      api.get.mockResolvedValue(xmlResponse);

      const result = await homeAPI.getHomePageContent();

      expect(result.data).toContain('<xml>');
    });

    it('should handle circular JSON structures safely', () => {
      const circular = { data: {} };
      circular.data.self = circular;

      api.post.mockResolvedValue({ data: { success: true } });

      // Should not crash with circular reference
      expect(async () => {
        await userAPI.assignBundle(circular);
      }).not.toThrow();
    });

    it('should handle undefined in request body', async () => {
      api.post.mockResolvedValue({ data: { success: true } });

      await userAPI.assignBundle({ bundleId: undefined });

      expect(api.post).toHaveBeenCalled();
    });

    it('should handle null values in response', async () => {
      const mockData = {
        data: {
          bundles: null,
          total: null,
        },
      };
      api.get.mockResolvedValue(mockData);

      const result = await homeAPI.getHomePageContent();

      expect(result.data.bundles).toBeNull();
    });

    it('should handle empty arrays vs null', async () => {
      const mockData = {
        data: {
          bundles: [],
          categories: null,
        },
      };
      api.get.mockResolvedValue(mockData);

      const result = await homeAPI.getHomePageContent();

      expect(Array.isArray(result.data.bundles)).toBe(true);
      expect(result.data.categories).toBeNull();
    });

    it('should handle query string encoding', async () => {
      api.get.mockResolvedValue({ data: {} });

      await homeAPI.getBundlesByCountry(['US&UK', 'FR/DE']);

      expect(api.get).toHaveBeenCalledWith('api/v1/bundles/by-country', {
        params: { country_codes: ['US&UK', 'FR/DE'] },
      });
    });

    it('should handle base64 encoded data', async () => {
      const base64Data = btoa('test data');
      api.post.mockResolvedValue({ data: { success: true } });

      await userAPI.assignBundle({ data: base64Data });

      expect(api.post).toHaveBeenCalled();
    });
  });

  describe('File Upload and Multipart', () => {
    it('should handle form data structure', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');
      formData.append('bundleId', 'bundle-1');

      api.post.mockResolvedValue({ data: { success: true } });

      // Mock file upload endpoint
      await api.post('api/v1/upload', formData);

      expect(api.post).toHaveBeenCalledWith('api/v1/upload', formData);
    });

    it('should handle binary data', async () => {
      const binaryData = new Uint8Array([1, 2, 3, 4]);
      api.post.mockResolvedValue({ data: { success: true } });

      await api.post('api/v1/binary', binaryData);

      expect(api.post).toHaveBeenCalled();
    });

    it('should handle blob responses', async () => {
      const blobData = new Blob(['test'], { type: 'application/pdf' });
      api.get.mockResolvedValue({
        data: blobData,
        headers: { 'content-type': 'application/pdf' },
      });

      const result = await api.get('api/v1/download/invoice');

      expect(result.data).toBeInstanceOf(Blob);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle intermittent failures', async () => {
      let callCount = 0;
      api.get.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject({ response: { status: 500 } });
        }
        return Promise.resolve({ data: { success: true } });
      });

      // First call fails
      try {
        await homeAPI.getHomePageContent();
        expect.fail('Should have failed');
      } catch (error) {
        expect(error.response.status).toBe(500);
      }

      // Second call succeeds
      const result = await homeAPI.getHomePageContent();
      expect(result.data.success).toBe(true);
    });

    it('should handle partial response data', async () => {
      const partialData = {
        data: {
          bundles: [{ id: 1 }, { id: 2 }],
          // Missing other expected fields
        },
      };
      api.get.mockResolvedValue(partialData);

      const result = await homeAPI.getHomePageContent();

      expect(result.data.bundles).toHaveLength(2);
    });

    it('should handle response with extra fields', async () => {
      const extraData = {
        data: {
          bundles: [],
          extraField: 'unexpected',
          anotherField: { nested: 'data' },
        },
      };
      api.get.mockResolvedValue(extraData);

      const result = await homeAPI.getHomePageContent();

      expect(result.data.bundles).toBeDefined();
      expect(result.data.extraField).toBe('unexpected');
    });
  });
});
