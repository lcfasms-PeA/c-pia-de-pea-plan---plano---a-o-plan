import { describe, expect, it } from "vitest";
import {
  hexToRgb,
  getContrastColor,
  validateCoverOptions,
  generateCoverSummary,
  COVER_THEMES,
  type CoverOptions,
} from "./coverCustomization";

describe("Cover Customization", () => {
  describe("hexToRgb", () => {
    it("should convert hex color to RGB", () => {
      const result = hexToRgb("#FF0000");
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("should handle lowercase hex", () => {
      const result = hexToRgb("#00ff00");
      expect(result).toEqual({ r: 0, g: 255, b: 0 });
    });

    it("should return default color for invalid hex", () => {
      const result = hexToRgb("invalid");
      expect(result).toEqual({ r: 31, g: 41, b: 55 });
    });
  });

  describe("getContrastColor", () => {
    it("should return white text for dark background", () => {
      const result = getContrastColor("#000000");
      expect(result).toBe("#FFFFFF");
    });

    it("should return black text for light background", () => {
      const result = getContrastColor("#FFFFFF");
      expect(result).toBe("#000000");
    });

    it("should return white for dark blue", () => {
      const result = getContrastColor("#1F2937");
      expect(result).toBe("#FFFFFF");
    });
  });

  describe("validateCoverOptions", () => {
    it("should validate complete cover options", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        theme: "padrao",
        primaryColor: "#1F2937",
        secondaryColor: "#3B82F6",
      };

      const result = validateCoverOptions(options);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
    });

    it("should reject missing company name", () => {
      const options: Partial<CoverOptions> = {
        theme: "padrao",
      };

      const result = validateCoverOptions(options);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject invalid color format", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        primaryColor: "invalid-color",
      };

      const result = validateCoverOptions(options);

      expect(result.valid).toBe(false);
    });

    it("should reject invalid theme", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        theme: "invalid-theme" as any,
      };

      const result = validateCoverOptions(options);

      expect(result.valid).toBe(false);
    });

    it("should use default values for optional fields", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
      };

      const result = validateCoverOptions(options);

      expect(result.valid).toBe(true);
      expect(result.data?.theme).toBe("padrao");
      expect(result.data?.logoPosition).toBe("top");
      expect(result.data?.logoWidth).toBe(150);
    });
  });

  describe("COVER_THEMES", () => {
    it("should have all required themes", () => {
      expect(COVER_THEMES.padrao).toBeDefined();
      expect(COVER_THEMES.minimalista).toBeDefined();
      expect(COVER_THEMES.corporativo).toBeDefined();
      expect(COVER_THEMES.academico).toBeDefined();
    });

    it("should have valid colors in themes", () => {
      Object.values(COVER_THEMES).forEach((theme) => {
        if (theme.primaryColor) {
          expect(theme.primaryColor).toMatch(/^#[0-9A-F]{6}$/i);
        }
        if (theme.secondaryColor) {
          expect(theme.secondaryColor).toMatch(/^#[0-9A-F]{6}$/i);
        }
      });
    });
  });

  describe("generateCoverSummary", () => {
    it("should generate cover summary", () => {
      const options: CoverOptions = {
        companyName: "Tech Corp",
        theme: "padrao",
        primaryColor: "#1F2937",
        secondaryColor: "#3B82F6",
        accentColor: "#10B981",
        logoUrl: "https://example.com/logo.png",
        logoPosition: "top",
        logoWidth: 150,
        includeInstitutionLogo: false,
        authorName: "John Doe",
        subtitle: "Business Plan 2026",
      };

      const summary = generateCoverSummary(options);

      expect(summary.theme).toBe("padrao");
      expect(summary.colors.primary).toBe("#1F2937");
      expect(summary.logo.hasCompanyLogo).toBe(true);
      expect(summary.logo.hasInstitutionLogo).toBe(false);
      expect(summary.content.company).toBe("Tech Corp");
      expect(summary.content.author).toBe("John Doe");
    });

    it("should indicate institution logo when included", () => {
      const options: CoverOptions = {
        companyName: "Tech Corp",
        theme: "corporativo",
        primaryColor: "#003366",
        secondaryColor: "#0066CC",
        accentColor: "#FF6600",
        logoUrl: "https://example.com/logo.png",
        logoPosition: "top",
        logoWidth: 180,
        includeInstitutionLogo: true,
        institutionLogoUrl: "https://example.com/institution.png",
      };

      const summary = generateCoverSummary(options);

      expect(summary.logo.hasInstitutionLogo).toBe(true);
    });
  });

  describe("Cover Theme Variations", () => {
    it("should support padrao theme", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        theme: "padrao",
      };

      const result = validateCoverOptions(options);
      expect(result.valid).toBe(true);
      expect(result.data?.theme).toBe("padrao");
    });

    it("should support minimalista theme", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        theme: "minimalista",
      };

      const result = validateCoverOptions(options);
      expect(result.valid).toBe(true);
      expect(result.data?.theme).toBe("minimalista");
    });

    it("should support corporativo theme", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        theme: "corporativo",
      };

      const result = validateCoverOptions(options);
      expect(result.valid).toBe(true);
      expect(result.data?.theme).toBe("corporativo");
    });

    it("should support academico theme", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        theme: "academico",
      };

      const result = validateCoverOptions(options);
      expect(result.valid).toBe(true);
      expect(result.data?.theme).toBe("academico");
    });
  });

  describe("Logo Validation", () => {
    it("should validate logo URL", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        logoUrl: "https://example.com/logo.png",
      };

      const result = validateCoverOptions(options);
      expect(result.valid).toBe(true);
    });

    it("should reject invalid logo URL", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        logoUrl: "not-a-url",
      };

      const result = validateCoverOptions(options);
      expect(result.valid).toBe(false);
    });

    it("should validate logo width constraints", () => {
      const optionsSmall: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        logoWidth: 40,
      };

      const resultSmall = validateCoverOptions(optionsSmall);
      expect(resultSmall.valid).toBe(false);

      const optionsLarge: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        logoWidth: 500,
      };

      const resultLarge = validateCoverOptions(optionsLarge);
      expect(resultLarge.valid).toBe(false);
    });
  });

  describe("Custom Text Validation", () => {
    it("should accept custom text", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        customText: "Confidential - For Internal Use Only",
      };

      const result = validateCoverOptions(options);
      expect(result.valid).toBe(true);
    });

    it("should limit custom text length", () => {
      const options: Partial<CoverOptions> = {
        companyName: "Tech Corp",
        customText: "A".repeat(501),
      };

      const result = validateCoverOptions(options);
      expect(result.valid).toBe(false);
    });
  });
});
