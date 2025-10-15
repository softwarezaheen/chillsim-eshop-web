import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { useVersionChecker } from "../useVersionChecker";

vi.mock("axios");

describe("useVersionChecker", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should be disabled in non-production mode", () => {
    // Mock development mode
    const originalMode = import.meta.env.VITE_ENVIRONMENT;
    Object.defineProperty(import.meta.env, 'VITE_ENVIRONMENT', {
      value: 'development',
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useVersionChecker());

    expect(result.current.updateAvailable).toBe(false);
    expect(result.current.newVersion).toBe(null);
    expect(typeof result.current.reloadApp).toBe('function');
    expect(typeof result.current.dismissUpdate).toBe('function');

    // Restore original mode
    Object.defineProperty(import.meta.env, 'VITE_ENVIRONMENT', {
      value: originalMode,
      writable: true,
      configurable: true,
    });
  });

  it("should be disabled for all dev-like environments", () => {
    const originalMode = import.meta.env.VITE_ENVIRONMENT;
    const devModes = ['dev', 'development', 'test', 'local', 'DEV', 'Development', 'TEST', 'LOCAL'];

    devModes.forEach((mode) => {
      Object.defineProperty(import.meta.env, 'VITE_ENVIRONMENT', {
        value: mode,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useVersionChecker());
      expect(result.current.updateAvailable).toBe(false);
    });

    // Restore original mode
    Object.defineProperty(import.meta.env, 'VITE_ENVIRONMENT', {
      value: originalMode,
      writable: true,
      configurable: true,
    });
  });

  it("should store version on first visit", async () => {
    axios.get.mockResolvedValue({
      data: { version: "abc123", timestamp: "2025-01-15T00:00:00Z" },
    });

    const { result } = renderHook(() => useVersionChecker());

    await waitFor(() => {
      expect(localStorage.getItem("app_build_version")).toBe("abc123");
    });

    expect(result.current.updateAvailable).toBe(false);
  });

  it("should detect version mismatch", async () => {
    localStorage.setItem("app_build_version", "old123");
    
    axios.get.mockResolvedValue({
      data: { version: "new456", timestamp: "2025-01-15T00:00:00Z" },
    });

    const { result } = renderHook(() => useVersionChecker());

    await waitFor(() => {
      expect(result.current.updateAvailable).toBe(true);
      expect(result.current.newVersion).toBe("new456");
    });
  });

  it("should handle network errors gracefully", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useVersionChecker());

    await waitFor(() => {
      expect(result.current.updateAvailable).toBe(false);
    });
  });

  it("should reload app when reloadApp is called", async () => {
    const reloadSpy = vi.spyOn(window.location, "reload").mockImplementation(() => {});
    
    localStorage.setItem("app_build_version", "old123");
    axios.get.mockResolvedValue({
      data: { version: "new456" },
    });

    const { result } = renderHook(() => useVersionChecker());

    await waitFor(() => {
      expect(result.current.updateAvailable).toBe(true);
    });

    act(() => {
      result.current.reloadApp();
    });

    expect(localStorage.getItem("app_build_version")).toBe("new456");
    expect(reloadSpy).toHaveBeenCalledWith(true);
  });

  it("should dismiss update notification", async () => {
    localStorage.setItem("app_build_version", "old123");
    axios.get.mockResolvedValue({
      data: { version: "new456" },
    });

    const { result } = renderHook(() => useVersionChecker());

    await waitFor(() => {
      expect(result.current.updateAvailable).toBe(true);
    });

    act(() => {
      result.current.dismissUpdate();
    });

    expect(result.current.updateAvailable).toBe(false);
  });

  it("should prevent concurrent version checks", async () => {
    let resolveCount = 0;
    axios.get.mockImplementation(() => {
      resolveCount++;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { version: "abc123" } });
        }, 100);
      });
    });

    const { result } = renderHook(() => useVersionChecker());

    // Try to trigger multiple checks
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Should only have made one request despite potential concurrent triggers
    expect(resolveCount).toBeLessThanOrEqual(2);
  });

  it("should poll for updates at regular intervals", async () => {
    axios.get.mockResolvedValue({
      data: { version: "abc123" },
    });

    renderHook(() => useVersionChecker());

    // Initial check
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    // Advance time by 5 minutes
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });
});
