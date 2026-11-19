import { describe, it, expect } from "vitest";
import {
  classifyTag,
  assessPrivacyRisk,
  buildRawMetadataEntries,
  formatBytes,
  getCleanFileName,
} from "@/components/exif-stripper/stripper";

describe("exif-stripper forensic engine", () => {
  it("classifies GPS, camera, date, and software EXIF tags accurately", () => {
    expect(classifyTag("latitude")).toEqual({ category: "gps", risk: "high" });
    expect(classifyTag("BodySerialNumber")).toEqual({ category: "camera", risk: "high" });
    expect(classifyTag("Model")).toEqual({ category: "camera", risk: "medium" });
    expect(classifyTag("DateTimeOriginal")).toEqual({ category: "datetime", risk: "medium" });
    expect(classifyTag("Software")).toEqual({ category: "software", risk: "medium" });
  });

  it("computes HIGH, MEDIUM, and CLEAN privacy risk assessments", () => {
    const clean = assessPrivacyRisk(null);
    expect(clean.level).toBe("clean");
    expect(clean.totalTags).toBe(0);

    const medium = assessPrivacyRisk({
      Make: "Sony",
      Model: "ILCE-7M4",
      DateTimeOriginal: "2026-10-14 18:42:00",
    });
    expect(medium.level).toBe("medium");
    expect(medium.hasCamera).toBe(true);
    expect(medium.hasDates).toBe(true);
    expect(medium.hasGps).toBe(false);

    const high = assessPrivacyRisk({
      Make: "Apple",
      latitude: 19.4326,
      longitude: -99.1332,
    });
    expect(high.level).toBe("high");
    expect(high.hasGps).toBe(true);
    expect(high.highRiskCount).toBeGreaterThanOrEqual(2);
  });

  it("sorts high-risk tags first and formats clean or anonymized filenames", () => {
    const entries = buildRawMetadataEntries({
      Software: "Lightroom",
      latitude: 47.6062,
      Orientation: 1,
    });
    expect(entries[0].key).toBe("latitude");
    expect(entries[0].risk).toBe("high");

    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(getCleanFileName("IMG_20261014.jpg", "image/webp", false)).toBe(
      "IMG_20261014-clean.webp"
    );
    expect(getCleanFileName("IMG_20261014.jpg", "image/jpeg", true)).toMatch(
      /^clearcut-clean-[a-f0-9]+\.jpg$/
    );
  });
});
