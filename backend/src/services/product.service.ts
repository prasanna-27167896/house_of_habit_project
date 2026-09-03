import * as productRepo from "@repos/product.repo";
import * as categoryRepo from "@repos/category.repo";
import * as brandRepo from "@repos/brand.repo";
import { Errors } from "@errors/index";
import { deleteFromPublicR2 } from "@services/cloudflare.service";
import { sortBySize } from "@utils/sizeOrder";
import type {
  ProductWithRelations,
  ProductVariant,
  ProductListResult,
  ProductGroupedCategory,
  ToggleProductResult,
  ProductWithSales,
} from "@interfaces/product.types";
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  ProductListQuery,
  ProductSearchQuery,
} from "@validators/product.schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMAGE_SLOT_PAIRS = [
  ["imageUrl", "imageKey"],
  ["imageUrl1", "imageKey1"],
  ["imageUrl2", "imageKey2"],
  ["imageUrl3", "imageKey3"],
] as const;

type ImageSlotKey = (typeof IMAGE_SLOT_PAIRS)[number][1];

const maybeDeleteOldImage = async (oldKey: string | null, newKey: string | null | undefined) => {
  if (oldKey && newKey !== undefined && newKey !== oldKey) {
    await deleteFromPublicR2(oldKey).catch(() => undefined);
  }
};

// ─── Product CRUD ─────────────────────────────────────────────────────────────

export const createProduct = async (input: CreateProductInput): Promise<ProductWithRelations> => {
  const category = await categoryRepo.findCategoryById(input.categoryId);
  if (!category) throw Errors.CATEGORY_NOT_FOUND();

  if (input.brandId != null) {
    const brand = await brandRepo.findBrandById(input.brandId);
    if (!brand) throw Errors.BRAND_NOT_FOUND();
  }

  // Validate inline variant SKUs up front — unique within the request AND globally —
  // so a collision returns a clear error instead of a raw DB unique-constraint failure.
  if (input.variants && input.variants.length > 0) {
    const skus = input.variants.map((v) => v.sku);
    const dupe = skus.find((s, i) => skus.indexOf(s) !== i);
    if (dupe) throw Errors.SKU_ALREADY_EXISTS(dupe);

    const existing = await productRepo.findExistingSkus(skus);
    if (existing.length > 0) throw Errors.SKU_ALREADY_EXISTS(existing[0]!);
  }

  return productRepo.createProduct(input);
};

export const updateProduct = async (productId: string, input: UpdateProductInput): Promise<ProductWithRelations> => {
  const product = await productRepo.findActiveProduct(productId);
  if (!product) throw Errors.PRODUCT_NOT_FOUND();

  if (input.categoryId != null) {
    const cat = await categoryRepo.findCategoryById(input.categoryId);
    if (!cat) throw Errors.CATEGORY_NOT_FOUND();
  }

  if (input.brandId != null) {
    const brand = await brandRepo.findBrandById(input.brandId);
    if (!brand) throw Errors.BRAND_NOT_FOUND();
  }

  // Validate pricing against the merged (final) values — the update may change only
  // one of price/discountedPrice, so we compare each against its resulting value.
  const finalPrice = input.price ?? product.price;
  const finalDiscounted = input.discountedPrice ?? product.discountedPrice;
  if (finalDiscounted > finalPrice) throw Errors.INVALID_PRICING();

  const updated = await productRepo.updateProductDb(productId, input, product);

  // Delete replaced images only AFTER the DB write succeeds — deletion is irreversible, so
  // doing it first would strand the product pointing at a missing object if the update
  // failed. Worst case now is a harmless orphaned object left in R2. (`product` was read
  // before the update, so it still holds the OLD image keys.)
  for (const [, keySlot] of IMAGE_SLOT_PAIRS) {
    if (keySlot in input) {
      await maybeDeleteOldImage(
        product[keySlot as ImageSlotKey],
        input[keySlot as keyof UpdateProductInput] as string | null | undefined,
      );
    }
  }

  return updated;
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const product = await productRepo.findActiveProduct(productId);
  if (!product) throw Errors.PRODUCT_NOT_FOUND();

  await productRepo.softDeleteProduct(productId);
};

export const toggleProductDisable = async (productId: string): Promise<ToggleProductResult> => {
  const product = await productRepo.findActiveProduct(productId);
  if (!product) throw Errors.PRODUCT_NOT_FOUND();

  return productRepo.toggleProductDisableDb(productId, !product.isDisabled);
};

// ─── Product Queries ──────────────────────────────────────────────────────────

export const getAllProducts = async (query: ProductListQuery): Promise<ProductListResult> =>
  productRepo.findAllActiveProducts(query);

export const getProductById = async (productId: string): Promise<ProductWithRelations> => {
  const product = await productRepo.findProductById(productId);
  if (!product) throw Errors.PRODUCT_NOT_FOUND();
  // Variants come back in creation order — re-sort to logical size order (S, M, L, XL...)
  // so the size-selection UI on the product page doesn't display them out of sequence.
  return { ...product, variants: sortBySize(product.variants) };
};

export const getProductsByCategory = async (categoryId: string, query: ProductListQuery): Promise<ProductListResult> =>
  productRepo.findProductsByCategory(categoryId, query);

export const getBestSellingProducts = async (limit: number): Promise<ProductWithSales[]> => {
  const ranked = await productRepo.findBestSellingProductIds(limit);
  if (ranked.length === 0) return [];

  const products = await productRepo.findProductsByIds(ranked.map((r) => r.productId));
  const byId = new Map(products.map((p) => [p.productId, p]));

  // Re-attach unitsSold and preserve the ranked order — findMany's `in` filter doesn't
  // guarantee result order matches the id list.
  return ranked
    .map((r) => {
      const product = byId.get(r.productId);
      return product ? { ...product, variants: sortBySize(product.variants), unitsSold: r.unitsSold } : null;
    })
    .filter((p): p is ProductWithSales => p !== null);
};

export const searchProducts = async (query: ProductSearchQuery): Promise<ProductListResult> =>
  productRepo.searchProductsDb(query);

export const getProductsGroupedByCategory = async (): Promise<ProductGroupedCategory[]> => {
  const products = await productRepo.findProductsGroupedByCategory();

  const grouped: Record<string, ProductGroupedCategory> = {};
  for (const p of products) {
    const key = String(p.categoryId);
    if (!grouped[key]) {
      grouped[key] = {
        categoryId: p.category.categoryId,
        categoryTitle: p.category.categoryTitle,
        products: [],
      };
    }
    grouped[key]!.products.push(p);
  }

  return Object.values(grouped).sort((a, b) => a.categoryTitle.localeCompare(b.categoryTitle));
};

// ─── Variant CRUD ─────────────────────────────────────────────────────────────

export const addVariant = async (productId: string, input: CreateVariantInput): Promise<ProductVariant> => {
  const product = await productRepo.findActiveProduct(productId);
  if (!product) throw Errors.PRODUCT_NOT_FOUND();

  const skuExists = await productRepo.findVariantBySku(input.sku);
  if (skuExists) throw Errors.SKU_ALREADY_EXISTS(input.sku);

  return productRepo.createVariant(productId, input);
};

export const updateVariant = async (
  productId: string,
  variantId: string,
  input: UpdateVariantInput,
): Promise<ProductVariant> => {
  const variant = await productRepo.findVariantById(variantId, productId);
  if (!variant) throw Errors.VARIANT_NOT_FOUND();

  if (input.sku && input.sku !== variant.sku) {
    const skuExists = await productRepo.findVariantBySku(input.sku);
    if (skuExists) throw Errors.SKU_ALREADY_EXISTS(input.sku);
  }

  return productRepo.updateVariantDb(variantId, input, variant);
};

export const deleteVariant = async (productId: string, variantId: string): Promise<void> => {
  const variant = await productRepo.findVariantById(variantId, productId);
  if (!variant) throw Errors.VARIANT_NOT_FOUND();

  // A variant on an order must stay — orders keep their item references. To hide a
  // sold variant, deactivate it (isActive:false) instead of deleting. (Cart items
  // cascade-delete, so an unsold variant is safe to hard-delete.)
  const orderRefs = await productRepo.countOrderItemsForVariant(variantId);
  if (orderRefs > 0) throw Errors.VARIANT_IN_USE();

  await productRepo.deleteVariantDb(variantId);
};
