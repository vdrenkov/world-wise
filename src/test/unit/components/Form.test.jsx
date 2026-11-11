import { describe, expect, it } from "vitest";

import { convertToEmoji } from "../../../types";

describe("Form utilities", () => {
  it("convertToEmoji_uppercaseCode_returnsFlag", () => {
    expect(convertToEmoji("BG")).toBe("🇧🇬");
  });

  it("convertToEmoji_lowercaseCode_returnsFlag", () => {
    expect(convertToEmoji("de")).toBe("🇩🇪");
  });
});
