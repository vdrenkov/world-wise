import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import AppErrorBoundary from "../../../components/AppErrorBoundary";

afterEach(() => vi.restoreAllMocks());

it("renderBoundary_healthyChild_showsContent", () => {
  render(
    <AppErrorBoundary>
      <p>Journal ready</p>
    </AppErrorBoundary>,
  );
  expect(screen.getByText("Journal ready")).toBeInTheDocument();
});

it("renderBoundary_childFails_providesReloadWithoutClearingStorage", () => {
  const logError = vi.spyOn(console, "error").mockImplementation(() => {});
  localStorage.setItem("worldwise.cities", "preserved");
  render(
    <AppErrorBoundary>
      <BrokenPage />
    </AppErrorBoundary>,
  );
  expect(
    screen.getByRole("heading", { name: "The journal could not open." }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Reload WorldWise" }),
  ).toHaveAttribute("href", "/");
  expect(localStorage.getItem("worldwise.cities")).toBe("preserved");
  expect(logError).toHaveBeenCalled();
  localStorage.clear();
});

function BrokenPage() {
  throw new Error("Chunk could not load");
}
