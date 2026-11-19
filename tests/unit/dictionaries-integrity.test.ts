import { describe, it, expect } from "vitest";
import esDict from "@/dictionaries/es.json";
import enDict from "@/dictionaries/en.json";

describe("i18n dictionaries integrity", () => {
  const requiredTopLevelKeys = [
    "common",
    "header",
    "hero",
    "features",
    "howItWorks",
    "optimizerInfo",
    "cta",
    "pricing",
  ] as const;

  it("contains all required top-level sections in both ES and EN dictionaries", () => {
    for (const key of requiredTopLevelKeys) {
      expect(esDict).toHaveProperty(key);
      expect(enDict).toHaveProperty(key);
    }
  });

  it("has non-empty core navigation and hero strings in ES and EN", () => {
    expect(esDict.header.pricing.trim().length).toBeGreaterThan(0);
    expect(enDict.header.pricing.trim().length).toBeGreaterThan(0);
    expect(esDict.howItWorks.steps.length).toBe(4);
    expect(enDict.howItWorks.steps.length).toBe(4);
  });
});
