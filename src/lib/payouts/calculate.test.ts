import { describe, it, expect } from "vitest";
import { calculatePayout } from "./calculate";

describe("calculatePayout", () => {
  it("calculates the example payout correctly", () => {
    const result = calculatePayout(150, 30);
    expect(result.platformFee).toBeCloseTo(22.5, 2);
    expect(result.providerReceives).toBeCloseTo(7.5, 2);
  });

  it("uses the provided platform fee rate", () => {
    const result = calculatePayout(100, 50, 0.1);
    expect(result.platformFee).toBeCloseTo(10, 2);
    expect(result.providerReceives).toBeCloseTo(40, 2);
  });

  it("rejects negative values", () => {
    expect(() => calculatePayout(-1, 30)).toThrow("serviceTotal must be non-negative");
    expect(() => calculatePayout(150, -1)).toThrow("depositAmount must be non-negative");
  });
});
