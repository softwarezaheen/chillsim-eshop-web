import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { store } from "../redux/store.jsx";
import "@testing-library/jest-dom";
import PlansWrapper from "../pages/plans/PlansWrapper.jsx";

describe("Main Page", () => {
  let container;

  beforeEach(() => {
    container = render(
      <MemoryRouter>
        <Provider store={store}>
          <PlansWrapper />
        </Provider>
      </MemoryRouter>,
    );
  });

  it("loads page without crashing", () => {
    expect(container).toBeTruthy();
  });

  it("renders the page", () => {
    expect(screen.getByText("Choose your plan")).toBeInTheDocument();
  });
});
