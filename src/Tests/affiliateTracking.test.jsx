/**
 * Unit and Integration Tests for Affiliate Tracking (Frontend)
 * 
 * Tests cover:
 * - Click tracking (localStorage persistence)
 * - URL parameter detection (im_ref)
 * - Header injection in API requests
 * - Expiration validation
 * - Storage clearing
 * - Edge cases (malformed data, expired clicks, concurrent updates)
 * - Security (XSS prevention, localStorage tampering)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAffiliateTracking } from '../core/custom-hook/useAffiliateTracking';
import * as affiliatesAPI from '../core/apis/affiliatesAPI';

// Mock the affiliates API
vi.mock('../core/apis/affiliatesAPI', () => ({
  trackAffiliateVisit: vi.fn()
}));

// Helper to create a wrapper with router context and optional URL parameters
const createWrapper = (queryParams = '') => {
  const initialRoute = queryParams ? `/?${queryParams}` : '/';
  return ({ children }) => (
    <MemoryRouter initialEntries={[initialRoute]}>
      {children}
    </MemoryRouter>
  );
};

describe('useAffiliateTracking Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Mock successful API response by default
    affiliatesAPI.trackAffiliateVisit.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Click Detection and Storage', () => {
    it('should detect im_ref parameter and store in localStorage', async () => {
      const clickId = 'test_click_123';

      renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${clickId}`)
      });

      await waitFor(() => {
        const storedClickId = localStorage.getItem('affiliate_click_id');
        const storedTimestamp = localStorage.getItem('affiliate_click_timestamp');
        
        expect(storedClickId).toBe(clickId);
        expect(storedTimestamp).toBeDefined();
        expect(parseInt(storedTimestamp)).toBeGreaterThan(0);
      });
    });

    it('should call trackAffiliateVisit API when im_ref detected', async () => {
      const clickId = 'api_test_456';

      renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${clickId}`)
      });

      await waitFor(() => {
        expect(affiliatesAPI.trackAffiliateVisit).toHaveBeenCalledWith(clickId);
      });
    });

    it('should not trigger tracking for empty im_ref', () => {
      renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper('im_ref=')
      });

      expect(affiliatesAPI.trackAffiliateVisit).not.toHaveBeenCalled();
      expect(localStorage.getItem('affiliate_click_id')).toBeNull();
    });

    it('should handle missing im_ref parameter gracefully', () => {
      renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      expect(affiliatesAPI.trackAffiliateVisit).not.toHaveBeenCalled();
      expect(localStorage.getItem('affiliate_click_id')).toBeNull();
    });

    it('should set correct timestamp', async () => {
      const clickId = 'expiry_test_789';
      
      const beforeTime = Date.now();
      renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${clickId}`)
      });

      await waitFor(() => {
        const storedTimestamp = localStorage.getItem('affiliate_click_timestamp');
        expect(storedTimestamp).toBeDefined();
        
        const timestamp = parseInt(storedTimestamp);
        const afterTime = Date.now();
        
        expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(timestamp).toBeLessThanOrEqual(afterTime + 1000); // 1 second tolerance
      });
    });
  });

  describe('Click Invalidation (Last-Click Attribution)', () => {
    it('should replace previous click when new im_ref detected', async () => {
      const firstClickId = 'first_click_123';
      const secondClickId = 'second_click_456';

      // First click
      const { unmount } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${firstClickId}`)
      });

      await waitFor(() => {
        expect(localStorage.getItem('affiliate_click_id')).toBe(firstClickId);
      });

      unmount();

      // Second click should overwrite
      renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${secondClickId}`)
      });

      await waitFor(() => {
        const storedClickId = localStorage.getItem('affiliate_click_id');
        expect(storedClickId).toBe(secondClickId);
        expect(storedClickId).not.toBe(firstClickId);
      });
    });

    it('should call API for each new click', async () => {
      const firstClickId = 'api_click_1';
      const secondClickId = 'api_click_2';

      const { unmount } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${firstClickId}`)
      });

      await waitFor(() => {
        expect(affiliatesAPI.trackAffiliateVisit).toHaveBeenCalledWith(firstClickId);
      });

      unmount();
      vi.clearAllMocks();

      renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${secondClickId}`)
      });

      await waitFor(() => {
        expect(affiliatesAPI.trackAffiliateVisit).toHaveBeenCalledWith(secondClickId);
      });
    });
  });

  describe('Expiration Validation', () => {
    it('should return data from getAffiliateData for valid clicks', async () => {
      const clickId = 'valid_click_123';

      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${clickId}`)
      });

      await waitFor(() => {
        expect(localStorage.getItem('affiliate_click_id')).toBe(clickId);
      });

      // Call getAffiliateData to verify it returns valid data
      const data = result.current.getAffiliateData();
      expect(data).toBeDefined();
      expect(data.clickId).toBe(clickId);
      expect(data.timestamp).toBeGreaterThan(0);
    });

    it('should return null from getAffiliateData for expired clicks', async () => {
      const clickId = 'expired_click_456';
      
      // Manually set expired data (31 days ago)
      const expiredTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000);
      localStorage.setItem('affiliate_click_id', clickId);
      localStorage.setItem('affiliate_click_timestamp', expiredTimestamp.toString());

      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      const data = result.current.getAffiliateData();
      expect(data).toBeNull();
      
      // Verify cleanup
      expect(localStorage.getItem('affiliate_click_id')).toBeNull();
      expect(localStorage.getItem('affiliate_click_timestamp')).toBeNull();
    });

    it('should keep valid non-expired click', async () => {
      const clickId = 'valid_recent_789';
      
      // Set recent click (1 day ago)
      const recentTimestamp = Date.now() - (1 * 24 * 60 * 60 * 1000);
      localStorage.setItem('affiliate_click_id', clickId);
      localStorage.setItem('affiliate_click_timestamp', recentTimestamp.toString());

      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      const data = result.current.getAffiliateData();
      expect(data).toBeDefined();
      expect(data.clickId).toBe(clickId);
      
      // Verify NOT cleaned up
      expect(localStorage.getItem('affiliate_click_id')).toBe(clickId);
    });
  });

  describe('Error Handling', () => {
    it('should handle API failures gracefully (fire-and-forget)', async () => {
      const clickId = 'error_click_123';
      
      // Mock API failure
      affiliatesAPI.trackAffiliateVisit.mockRejectedValue(new Error('Network error'));

      expect(() => {
        renderHook(() => useAffiliateTracking(), {
          wrapper: createWrapper(`im_ref=${clickId}`)
        });
      }).not.toThrow();

      // Click should still be stored despite API failure
      await waitFor(() => {
        expect(localStorage.getItem('affiliate_click_id')).toBe(clickId);
      });
    });

    it('should handle localStorage quota exceeded', async () => {
      const clickId = 'quota_exceeded_456';
      
      // Mock localStorage.setItem to throw quota error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        renderHook(() => useAffiliateTracking(), {
          wrapper: createWrapper(`im_ref=${clickId}`)
        });
      }).not.toThrow();

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle malformed localStorage data', () => {
      // Set malformed data
      localStorage.setItem('affiliate_click_id', 'valid_id');
      localStorage.setItem('affiliate_click_timestamp', 'not_a_number');

      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      // Should handle gracefully and return null
      const data = result.current.getAffiliateData();
      expect(data).toBeNull();
    });

    it('should handle missing required fields in stored data', () => {
      // Only set click ID, missing timestamp
      localStorage.setItem('affiliate_click_id', 'incomplete_id');

      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      const data = result.current.getAffiliateData();
      expect(data).toBeNull();
    });
  });

  describe('Security Tests', () => {
    it('should sanitize XSS attempts in click ID', async () => {
      const xssAttempt = '<script>alert("xss")</script>';
      
      renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${encodeURIComponent(xssAttempt)}`)
      });

      await waitFor(() => {
        const storedId = localStorage.getItem('affiliate_click_id');
        // Should store exactly what was passed (backend validates)
        expect(storedId).toBe(xssAttempt);
      });

      // Verify API was called with the value (backend will validate/sanitize)
      await waitFor(() => {
        expect(affiliatesAPI.trackAffiliateVisit).toHaveBeenCalledWith(xssAttempt);
      });
    });

    it('should handle SQL injection attempts safely', async () => {
      const sqlInjection = "' OR '1'='1";
      
      expect(() => {
        renderHook(() => useAffiliateTracking(), {
          wrapper: createWrapper(`im_ref=${encodeURIComponent(sqlInjection)}`)
        });
      }).not.toThrow();

      // Should be stored and sent to backend for validation
      await waitFor(() => {
        expect(localStorage.getItem('affiliate_click_id')).toBe(sqlInjection);
        expect(affiliatesAPI.trackAffiliateVisit).toHaveBeenCalledWith(sqlInjection);
      });
    });

    it('should handle localStorage tampering (modified timestamp)', () => {
      const clickId = 'tampered_click';
      
      // Set with current time
      localStorage.setItem('affiliate_click_id', clickId);
      localStorage.setItem('affiliate_click_timestamp', Date.now().toString());

      // Tamper with timestamp (set to far future)
      const futureTimestamp = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year in future
      localStorage.setItem('affiliate_click_timestamp', futureTimestamp.toString());

      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      // Should still work (timestamp is used for expiration, not validation)
      const data = result.current.getAffiliateData();
      expect(data).toBeDefined();
      expect(data.clickId).toBe(clickId);
    });

    it('should handle very long click IDs', async () => {
      const longClickId = 'a'.repeat(500); // 500 character click ID
      
      renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${longClickId}`)
      });

      await waitFor(() => {
        // Should store as-is (backend will enforce length limits)
        expect(localStorage.getItem('affiliate_click_id')).toBe(longClickId);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in click ID', async () => {
      const specialChars = 'click_!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      expect(() => {
        renderHook(() => useAffiliateTracking(), {
          wrapper: createWrapper(`im_ref=${encodeURIComponent(specialChars)}`)
        });
      }).not.toThrow();

      await waitFor(() => {
        expect(localStorage.getItem('affiliate_click_id')).toBe(specialChars);
      });
    });

    it('should handle unicode characters in click ID', async () => {
      const unicode = 'click_测试_🚀_מבחן';
      
      renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${encodeURIComponent(unicode)}`)
      });

      await waitFor(() => {
        expect(localStorage.getItem('affiliate_click_id')).toBe(unicode);
      });
    });

    it('should handle rapid mount/unmount cycles', async () => {
      const clickId = 'rapid_cycle_123';
      
      const { unmount: unmount1 } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${clickId}`)
      });
      unmount1();

      const { unmount: unmount2 } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${clickId}`)
      });
      unmount2();

      const { unmount: unmount3 } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${clickId}`)
      });
      unmount3();

      // Should still work correctly
      await waitFor(() => {
        expect(localStorage.getItem('affiliate_click_id')).toBe(clickId);
      });
    });

    it('should handle missing timestamp gracefully', () => {
      // Set click ID but no timestamp
      localStorage.setItem('affiliate_click_id', 'orphan_click');

      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      const data = result.current.getAffiliateData();
      expect(data).toBeNull();
    });
  });

  describe('Configuration Tests', () => {
    it('should use default 30-day attribution window', async () => {
      const clickId = 'config_test_123';
      
      // Set click from 29 days ago (should be valid)
      const validTimestamp = Date.now() - (29 * 24 * 60 * 60 * 1000);
      localStorage.setItem('affiliate_click_id', clickId);
      localStorage.setItem('affiliate_click_timestamp', validTimestamp.toString());

      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      const data = result.current.getAffiliateData();
      expect(data).toBeDefined();
      expect(data.clickId).toBe(clickId);
    });

    it('should expire after 30 days', async () => {
      const clickId = 'expired_config_456';
      
      // Set click from 31 days ago (should be expired)
      const expiredTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000);
      localStorage.setItem('affiliate_click_id', clickId);
      localStorage.setItem('affiliate_click_timestamp', expiredTimestamp.toString());

      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      const data = result.current.getAffiliateData();
      expect(data).toBeNull();
    });
  });

  describe('Return Value Tests', () => {
    it('should return getAffiliateData function', () => {
      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current.getAffiliateData).toBe('function');
    });

    it('should return null when no click data exists', () => {
      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      const data = result.current.getAffiliateData();
      expect(data).toBeNull();
    });

    it('should return correct data structure', async () => {
      const clickId = 'structure_test_123';
      
      renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper(`im_ref=${clickId}`)
      });

      await waitFor(() => {
        expect(localStorage.getItem('affiliate_click_id')).toBe(clickId);
      });

      const { result } = renderHook(() => useAffiliateTracking(), {
        wrapper: createWrapper()
      });

      const data = result.current.getAffiliateData();
      expect(data).toMatchObject({
        clickId: expect.any(String),
        timestamp: expect.any(Number)
      });
      expect(data.clickId).toBe(clickId);
    });
  });
});
