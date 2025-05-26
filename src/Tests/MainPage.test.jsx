import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { store } from "../redux/store.jsx";
import "@testing-library/jest-dom";
import PlansWrapper from "../pages/plans/PlansWrapper.jsx";

describe("Main Page", () => {
  it("renders without crashing", () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <PlansWrapper />
        </Provider>
      </MemoryRouter>,
    );
    // Check for a key element to confirm render
    expect(screen.getByText("plans.chooseYourPlan")).toBeInTheDocument();
  });

  it("displays the correct page content", () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <PlansWrapper />
        </Provider>
      </MemoryRouter>,
    );
    expect(screen.getByText("plans.chooseYourPlan")).toBeInTheDocument();
  });
});
