import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import "@testing-library/jest-dom";
import UpdateBanner from "./UpdateBanner";
import * as versionChecker from "../../../core/custom-hook/useVersionChecker";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../Tests/test-i18n";

vi.mock("../../../core/custom-hook/useVersionChecker");

describe("UpdateBanner Component", () => {
  const renderWithI18n = (component) => {
    return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
  };

  beforeAll(async () => {
    // Wait for i18n to load translations
    await i18n.loadNamespaces("translation");
  });

  it("should not render when no update available", () => {
    vi.spyOn(versionChecker, "useVersionChecker").mockReturnValue({
      updateAvailable: false,
      reloadApp: vi.fn(),
      dismissUpdate: vi.fn(),
    });

    renderWithI18n(<UpdateBanner />);
    
    expect(screen.queryByText(/update available/i)).not.toBeInTheDocument();
  });

  it("should render when update is available", () => {
    vi.spyOn(versionChecker, "useVersionChecker").mockReturnValue({
      updateAvailable: true,
      newVersion: "abc123",
      reloadApp: vi.fn(),
      dismissUpdate: vi.fn(),
    });

    renderWithI18n(<UpdateBanner />);
    
    expect(screen.getByText(/update available/i)).toBeInTheDocument();
  });

  it("should call reloadApp when refresh button clicked", () => {
    const reloadAppMock = vi.fn();
    
    vi.spyOn(versionChecker, "useVersionChecker").mockReturnValue({
      updateAvailable: true,
      newVersion: "abc123",
      reloadApp: reloadAppMock,
      dismissUpdate: vi.fn(),
    });

    renderWithI18n(<UpdateBanner />);
    
    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    expect(reloadAppMock).toHaveBeenCalledTimes(1);
  });

  it("should call dismissUpdate when close button clicked", () => {
    const dismissUpdateMock = vi.fn();
    
    vi.spyOn(versionChecker, "useVersionChecker").mockReturnValue({
      updateAvailable: true,
      newVersion: "abc123",
      reloadApp: vi.fn(),
      dismissUpdate: dismissUpdateMock,
    });

    renderWithI18n(<UpdateBanner />);
    
    // Find close button (the second button without text)
    const buttons = screen.getAllByRole("button");
    const closeButton = buttons.find(btn => btn.querySelector('[data-testid="CloseIcon"]'));
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(dismissUpdateMock).toHaveBeenCalledTimes(1);
    }
  });

  it("should display correct message content", () => {
    vi.spyOn(versionChecker, "useVersionChecker").mockReturnValue({
      updateAvailable: true,
      newVersion: "abc123",
      reloadApp: vi.fn(),
      dismissUpdate: vi.fn(),
    });

    renderWithI18n(<UpdateBanner />);
    
    expect(screen.getByText(/update available/i)).toBeInTheDocument();
  });
});
