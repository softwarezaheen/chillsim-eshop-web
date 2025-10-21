import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SmartAppBanner from "./SmartAppBanner";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n";
import * as gtmUtils from "../../../core/utils/gtm";

// Mock GTM utility
vi.mock("../../../core/utils/gtm", () => ({
  gtmEvent: vi.fn(),
}));

describe("SmartAppBanner Component", () => {
  let originalUserAgent;
  let originalNavigator;

  const renderWithI18n = (component) => {
    return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
  };

  beforeEach(() => {
    // Store original values
    originalUserAgent = navigator.userAgent;
    originalNavigator = global.navigator;
    
    // Clear session storage before each test
    sessionStorage.clear();
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(global.navigator, "userAgent", {
      value: originalUserAgent,
      writable: true,
      configurable: true,
    });
    sessionStorage.clear();
  });

  const mockUserAgent = (userAgent) => {
    Object.defineProperty(global.navigator, "userAgent", {
      value: userAgent,
      writable: true,
      configurable: true,
    });
  };

  describe("Banner Visibility", () => {
    it("should not render on regular desktop browsers", () => {
      mockUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(screen.queryByText(/open in/i)).not.toBeInTheDocument();
    });

    it("should not render on regular mobile Safari", () => {
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(screen.queryByText(/open in/i)).not.toBeInTheDocument();
    });

    it("should render when accessed from Instagram in-app browser on mobile", () => {
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(screen.getByText(/open in/i)).toBeInTheDocument();
    });

    it("should render when accessed from Facebook in-app browser (FBAN) on mobile", () => {
      mockUserAgent("Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.0 Chrome/87.0.4280.141 Mobile Safari/537.36 [FBAN/FB4A;FBAV/308.0.0.32.119;]");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(screen.getByText(/open in/i)).toBeInTheDocument();
    });

    it("should render when accessed from TikTok in-app browser on mobile", () => {
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly (TikTok)");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(screen.getByText(/open in/i)).toBeInTheDocument();
    });

    it("should render when accessed from Twitter in-app browser on mobile", () => {
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Twitter");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(screen.getByText(/open in/i)).toBeInTheDocument();
    });

    it("should render when accessed from Snapchat in-app browser on mobile", () => {
      mockUserAgent("Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.120 Mobile Safari/537.36 Snapchat");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(screen.getByText(/open in/i)).toBeInTheDocument();
    });

    it("should render when accessed from LinkedIn in-app browser on mobile", () => {
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 LinkedIn");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(screen.getByText(/open in/i)).toBeInTheDocument();
    });

    it("should not render if previously dismissed in session", () => {
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram");
      sessionStorage.setItem("chillsim_app_banner_dismissed", "true");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(screen.queryByText(/open in/i)).not.toBeInTheDocument();
    });

    it("should not render on in-app browser but desktop device", () => {
      mockUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Instagram");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(screen.queryByText(/open in/i)).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    beforeEach(() => {
      // Setup Instagram mobile user agent for these tests
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram");
    });

    it("should call dismiss handler and hide banner when close button clicked", async () => {
      renderWithI18n(<SmartAppBanner />);
      
      const closeButton = screen.getByLabelText(/dismiss/i);
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/open in/i)).not.toBeInTheDocument();
      });
      
      expect(sessionStorage.getItem("chillsim_app_banner_dismissed")).toBe("true");
    });

    it("should track dismissal event when close button clicked", () => {
      renderWithI18n(<SmartAppBanner />);
      
      const closeButton = screen.getByLabelText(/dismiss/i);
      fireEvent.click(closeButton);
      
      expect(gtmUtils.gtmEvent).toHaveBeenCalledWith("smart_banner_dismiss", {
        event_category: "engagement",
        event_label: "app_banner_dismissed",
      });
    });

    it("should attempt to open app with deep link when open button clicked", () => {
      // Mock window.location
      delete window.location;
      window.location = { href: "http://localhost:5173/plans" };
      
      renderWithI18n(<SmartAppBanner />);
      
      const openButton = screen.getByText(/open/i);
      fireEvent.click(openButton);
      
      expect(window.location.href).toContain("chillsim://open?source=web&url=");
      expect(window.location.href).toContain(encodeURIComponent("http://localhost:5173/plans"));
    });

    it("should track open app click event", () => {
      renderWithI18n(<SmartAppBanner />);
      
      const openButton = screen.getByText(/open/i);
      fireEvent.click(openButton);
      
      expect(gtmUtils.gtmEvent).toHaveBeenCalledWith("smart_banner_click", expect.objectContaining({
        event_category: "engagement",
        event_label: "app_banner_open_clicked",
        value: 1,
      }));
    });
  });

  describe("Analytics Tracking", () => {
    it("should track banner impression on mount when visible", () => {
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(gtmUtils.gtmEvent).toHaveBeenCalledWith("smart_banner_impression", expect.objectContaining({
        event_category: "engagement",
        event_label: "app_banner_shown",
        user_agent: expect.stringContaining("Instagram"),
      }));
    });

    it("should not track impression when banner not visible", () => {
      mockUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(gtmUtils.gtmEvent).not.toHaveBeenCalled();
    });
  });

  describe("Responsive Design", () => {
    beforeEach(() => {
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram");
    });

    it("should render all required UI elements", () => {
      renderWithI18n(<SmartAppBanner />);
      
      // Check for main text elements
      expect(screen.getByText(/open in/i)).toBeInTheDocument();
      expect(screen.getByText(/better experience/i)).toBeInTheDocument();
      
      // Check for action buttons
      expect(screen.getByText(/open/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dismiss/i)).toBeInTheDocument();
    });

    it("should have proper ARIA labels for accessibility", () => {
      renderWithI18n(<SmartAppBanner />);
      
      const openButton = screen.getByLabelText(/open/i);
      const closeButton = screen.getByLabelText(/dismiss/i);
      
      expect(openButton).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing navigator.userAgent gracefully", () => {
      Object.defineProperty(global.navigator, "userAgent", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      expect(() => renderWithI18n(<SmartAppBanner />)).not.toThrow();
    });

    it("should handle missing navigator.vendor gracefully", () => {
      Object.defineProperty(global.navigator, "vendor", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      mockUserAgent("Mozilla/5.0 (iPhone) Instagram");
      
      renderWithI18n(<SmartAppBanner />);
      
      expect(screen.getByText(/open in/i)).toBeInTheDocument();
    });

    it("should handle session storage errors gracefully", () => {
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram");
      
      // Mock sessionStorage.setItem to throw error
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = vi.fn(() => {
        throw new Error("QuotaExceededError");
      });
      
      renderWithI18n(<SmartAppBanner />);
      const closeButton = screen.getByLabelText(/dismiss/i);
      
      expect(() => fireEvent.click(closeButton)).not.toThrow();
      
      // Restore
      sessionStorage.setItem = originalSetItem;
    });

    it("should handle logo load error and show fallback", () => {
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram");
      
      renderWithI18n(<SmartAppBanner />);
      
      const logo = screen.getByAltText("ChillSim");
      
      // Simulate image load error
      fireEvent.error(logo);
      
      // The error handler should hide the image
      expect(logo.style.display).toBe("none");
    });
  });

  describe("Deep Linking", () => {
    beforeEach(() => {
      mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram");
      delete window.location;
      window.location = { href: "" };
    });

    it("should include current URL in deep link", () => {
      window.location.href = "http://localhost:5173/plans?country=US";
      
      renderWithI18n(<SmartAppBanner />);
      
      const openButton = screen.getByText(/open/i);
      fireEvent.click(openButton);
      
      expect(window.location.href).toContain("chillsim://open");
      expect(window.location.href).toContain("source=web");
      expect(window.location.href).toContain(encodeURIComponent("http://localhost:5173/plans?country=US"));
    });

    it("should properly encode URLs with special characters", () => {
      window.location.href = "http://localhost:5173/referral?referralCode=EB5AA1A7&utm_source=instagram";
      
      renderWithI18n(<SmartAppBanner />);
      
      const openButton = screen.getByText(/open/i);
      fireEvent.click(openButton);
      
      const expectedUrl = encodeURIComponent("http://localhost:5173/referral?referralCode=EB5AA1A7&utm_source=instagram");
      expect(window.location.href).toContain(expectedUrl);
    });
  });
});
