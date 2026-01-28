import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { store } from "../redux/store.jsx";
import "@testing-library/jest-dom";
import PlansWrapper from "../pages/plans/PlansWrapper.jsx";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe("Main Page", () => {
  it("renders without crashing", () => {
    render(
      <MemoryRouter initialEntries={["/plans/land"]}>
        <Provider store={store}>
          <PlansWrapper />
        </Provider>
      </MemoryRouter>,
    );
    // Check for a key element to confirm render (i18n key will be rendered as-is due to mock)
    expect(screen.getByText("plans.chooseYourPlan")).toBeInTheDocument();
  });

  it("displays the correct page content", () => {
    render(
      <MemoryRouter initialEntries={["/plans/land"]}>
        <Provider store={store}>
          <PlansWrapper />
        </Provider>
      </MemoryRouter>,
    );
    expect(screen.getByText("plans.chooseYourPlan")).toBeInTheDocument();
  });
});
