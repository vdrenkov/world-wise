import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Message from "../../../components/Message";

describe("Message", () => {
  it("renders the passed message text", () => {
    render(<Message message="No cities yet." />);

    expect(screen.getByText("No cities yet.")).toBeInTheDocument();
  });

  it("renders an accessible waving hand icon", () => {
    render(<Message message="Add your first city." />);

    expect(screen.getByRole("img", { name: "Waving hand" })).toBeInTheDocument();
  });
});
