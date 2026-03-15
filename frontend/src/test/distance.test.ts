import { describe, it, expect } from "vitest";
import { calculateDistance, formatDistance, getDirectionsUrl } from "@/lib/distance";

describe("calculateDistance", () => {
  it("returns 0 for identical coordinates", () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
  });

  it("calculates the approximate distance between two known cities", () => {
    // Bengaluru (12.9716, 77.5946) to Hyderabad (17.3850, 78.4867) ≈ 500 km
    const km = calculateDistance(12.9716, 77.5946, 17.385, 78.4867);
    expect(km).toBeGreaterThan(490);
    expect(km).toBeLessThan(520);
  });

  it("is symmetric", () => {
    const d1 = calculateDistance(12.9716, 77.5946, 17.385, 78.4867);
    const d2 = calculateDistance(17.385, 78.4867, 12.9716, 77.5946);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001);
  });
});

describe("formatDistance", () => {
  it("formats sub-kilometre distances in metres", () => {
    expect(formatDistance(0.5)).toBe("500 m away");
  });

  it("formats distances of 1 km and above with one decimal place", () => {
    expect(formatDistance(2.4)).toBe("2.4 km away");
    expect(formatDistance(100)).toBe("100.0 km away");
  });

  it("rounds metres correctly", () => {
    expect(formatDistance(0.9999)).toBe("1000 m away");
  });
});

describe("getDirectionsUrl", () => {
  it("builds a valid Google Maps directions URL", () => {
    const url = getDirectionsUrl(12.9716, 77.5946, "Bengaluru, Karnataka, India");
    expect(url).toContain("https://www.google.com/maps/dir/");
    expect(url).toContain("origin=12.9716%2C77.5946");
    expect(url).toContain("destination=Bengaluru");
  });

  it("URL-encodes special characters in the destination", () => {
    const url = getDirectionsUrl(0, 0, "New Delhi, India");
    expect(url).toContain(encodeURIComponent("New Delhi, India"));
  });
});
