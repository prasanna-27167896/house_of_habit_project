import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as faqRepo from "@repos/faq.repo";
import * as categoryRepo from "@repos/category.repo";
import * as productRepo from "@repos/product.repo";

type SetupWarning = {
  code: string;
  severity: "critical" | "warning";
  message: string;
};

export const getSetupStatus = asyncHandler(async (_req: Request, res: Response) => {
  const [storeInfo, categoryCount, productCount, variantsWithStock] = await Promise.all([
    faqRepo.findStoreInfo(),
    categoryRepo.countActiveCategories(),
    productRepo.countActiveProducts(),
    productRepo.countActiveVariantsWithStock(),
  ]);

  const warnings: SetupWarning[] = [];

  // ── Store info ───────────────────────────────────────────────────────────────
  if (!storeInfo) {
    warnings.push({
      code: "STORE_INFO_MISSING",
      severity: "critical",
      message: "Store info is not configured. Shipping charges will be ₹0 for all orders. Go to Settings → Store Info.",
    });
  } else {
    if (storeInfo.shippingCharge === 0 && storeInfo.freeShippingAbove == null) {
      warnings.push({
        code: "SHIPPING_CHARGE_ZERO",
        severity: "warning",
        message: "Shipping charge is ₹0 and no free-shipping threshold is set. Update Store Info if you intend to charge shipping.",
      });
    }

    if (!storeInfo.email) {
      warnings.push({
        code: "STORE_EMAIL_MISSING",
        severity: "warning",
        message: "Store contact email is not set. Customers won't see a support email.",
      });
    }

    if (!storeInfo.phone) {
      warnings.push({
        code: "STORE_PHONE_MISSING",
        severity: "warning",
        message: "Store contact phone is not set. Customers won't see a support number.",
      });
    }
  }

  // ── Catalogue ────────────────────────────────────────────────────────────────
  if (categoryCount === 0) {
    warnings.push({
      code: "NO_ACTIVE_CATEGORIES",
      severity: "critical",
      message: "No active categories found. Add at least one category before going live.",
    });
  }

  if (productCount === 0) {
    warnings.push({
      code: "NO_ACTIVE_PRODUCTS",
      severity: "critical",
      message: "No active products found. Add products before going live.",
    });
  } else if (variantsWithStock === 0) {
    warnings.push({
      code: "NO_VARIANTS_IN_STOCK",
      severity: "critical",
      message: "All product variants are out of stock. Customers cannot place orders.",
    });
  }

  const criticalCount = warnings.filter((w) => w.severity === "critical").length;

  sendSuccess(res, {
    isReady: criticalCount === 0,
    criticalCount,
    warningCount: warnings.filter((w) => w.severity === "warning").length,
    warnings,
  });
});
