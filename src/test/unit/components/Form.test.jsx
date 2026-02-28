import { describe, expect, it } from "vitest";

import { convertToEmoji } from "../../../components/Form";

describe("Form utilities", () => {
  it("converts an uppercase country code to a flag emoji", () => {
    expect(convertToEmoji("BG")).toBe("🇧🇬");
  });

  it("converts a lowercase country code to a flag emoji", () => {
    expect(convertToEmoji("de")).toBe("🇩🇪");
  });
});
