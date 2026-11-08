import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Button from "../../../components/Button";

describe("Button", () => {
  it("renderButton_primaryVariant_showsLabelAndStyle", () => {
    render(<Button type="primary">Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button.className).toContain("btn");
    expect(button.className).toContain("primary");
  });

  it("clickButton_enabled_callsHandler", () => {
    const onClick = vi.fn();
    render(
      <Button type="back" onClick={onClick}>
        Back
      </Button>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
