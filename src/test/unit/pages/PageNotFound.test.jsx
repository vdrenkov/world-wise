import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PageNotFound from "../../../pages/PageNotFound";

describe("PageNotFound", () => {
  it("renders a not-found heading", () => {
    render(<PageNotFound />);

    expect(
      screen.getByRole("heading", { name: "Page not found 😢" }),
    ).toBeInTheDocument();
  });
});
