import { prisma } from "@lib/prisma";
import type { Product, ProductWithRelations, ProductVariant, ProductListResult, ToggleProductResult } from "@interfaces/product.types";
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  ProductListQuery,
  ProductSearchQuery,
} from "@validators/product.schema";

// ─── Shared include ───────────────────────────────────────────────────────────

export const productInclude = {
  category: { select: { categoryId: true, categoryTitle: true } },
  brand: { select: { brandId: true, brandName: true } },
  variants: { where: { isActive: true }, orderBy: { createdAt: "asc" as const } },
} as const;

const activeWhere = { isDeleted: false, isDisabled: false } as const;

// Discount % is always derived from price/discountedPrice — never stored from client input,
// so the badge can't contradict the actual prices. price is a positive int, so no div-by-zero.
const computeDiscountPercentage = (price: number, discountedPrice: number): number =>
  price > 0 ? Math.round((1 - discountedPrice / price) * 100) : 0;

const buildSortOrder = (sortBy: ProductListQuery["sortBy"]) => {
  switch (sortBy) {
    case "price_low_high": return { discountedPrice: "asc" as const };
    case "price_high_low": return { discountedPrice: "desc" as const };
    case "popular":        return { totalReviews: "desc" as const }; // most-reviewed = popular
    default:               return { createdAt: "desc" as const };
  }
};

// ─── Product queries ──────────────────────────────────────────────────────────

export const findProductById = (productId: string): Promise<ProductWithRelations | null> =>
  prisma.product.findFirst({
    where: { productId, isDeleted: false },
    // productInclude already filters to active variants — don't override it, or the
    // public detail page leaks deactivated variants.
    include: productInclude,
  }) as Promise<ProductWithRelations | null>;

export const findActiveProduct = (productId: string): Promise<Product | null> =>
  prisma.product.findFirst({ where: { productId, isDeleted: false } });

export const findVisibleProduct = (productId: string): Promise<Product | null> =>
  prisma.product.findFirst({ where: { productId, isDeleted: false, isDisabled: false } });

export const findAllActiveProducts = async (query: ProductListQuery): Promise<ProductListResult> => {
  const skip = (query.page - 1) * query.limit;
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where: activeWhere, orderBy: buildSortOrder(query.sortBy), skip, take: query.limit, include: productInclude }),
    prisma.product.count({ where: activeWhere }),
  ]);
  return { products: products as ProductWithRelations[], total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};

export const findProductsByCategory = async (categoryId: string, query: ProductListQuery): Promise<ProductListResult> => {
  const skip = (query.page - 1) * query.limit;
  const where = { ...activeWhere, categoryId };
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, orderBy: buildSortOrder(query.sortBy), skip, take: query.limit, include: productInclude }),
    prisma.product.count({ where }),
  ]);
  return { products: products as ProductWithRelations[], total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};

export const searchProductsDb = async (query: ProductSearchQuery): Promise<ProductListResult> => {
  const { keyword, categoryId, brandId, gender, season, minPrice, maxPrice, page, limit, sortBy } = query;
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false as const,
    isDisabled: false as const,
    ...(keyword && {
      OR: [
        { title: { contains: keyword, mode: "insensitive" as const } },
        { description: { contains: keyword, mode: "insensitive" as const } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(brandId && { brandId }),
    ...(gender && { gender }),
    ...(season && { season }),
    ...((minPrice != null || maxPrice != null) && {
      discountedPrice: {
        ...(minPrice != null && { gte: minPrice }),
        ...(maxPrice != null && { lte: maxPrice }),
      },
    }),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, orderBy: buildSortOrder(sortBy), skip, take: limit, include: productInclude }),
    prisma.product.count({ where }),
  ]);
  return { products: products as ProductWithRelations[], total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const findProductsGroupedByCategory = (): Promise<ProductWithRelations[]> =>
  prisma.product.findMany({
    where: activeWhere,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { categoryId: true, categoryTitle: true } },
      brand: { select: { brandId: true, brandName: true } },
      variants: { where: { isActive: true } },
    },
  }) as Promise<ProductWithRelations[]>;

// ─── Product mutations ────────────────────────────────────────────────────────

export const createProduct = (input: CreateProductInput): Promise<ProductWithRelations> => {
  const { variants, ...f } = input;
  return prisma.product.create({
    data: {
      title: f.title,
      description: f.description ?? null,
      longDescription: f.longDescription ?? null,
      price: f.price,
      discountedPrice: f.discountedPrice,
      discountPercentage: computeDiscountPercentage(f.price, f.discountedPrice),
      gender: f.gender ?? null,
      fitType: f.fitType ?? null,
      season: f.season ?? null,
      material: f.material ?? null,
      occasion: f.occasion ?? null,
      pattern: f.pattern ?? null,
      imageUrl: f.imageUrl ?? null,
      imageKey: f.imageKey ?? null,
      imageUrl1: f.imageUrl1 ?? null,
      imageKey1: f.imageKey1 ?? null,
      imageUrl2: f.imageUrl2 ?? null,
      imageKey2: f.imageKey2 ?? null,
      imageUrl3: f.imageUrl3 ?? null,
      imageKey3: f.imageKey3 ?? null,
      returnPolicy: f.returnPolicy ?? null,
      categoryId: f.categoryId,
      ...(f.brandId != null ? { brandId: f.brandId } : {}),
      ...(variants?.length
        ? { variants: { create: variants.map((v) => ({ ...v, price: v.price ?? null, colorCode: v.colorCode ?? null })) } }
        : {}),
    },
    include: productInclude,
  }) as Promise<ProductWithRelations>;
};

export const updateProductDb = (
  productId: string,
  input: UpdateProductInput,
  existing: Awaited<ReturnType<typeof findActiveProduct>> & object,
): Promise<ProductWithRelations> =>
  prisma.product.update({
    where: { productId },
    data: {
      title: input.title ?? existing.title,
      description: input.description !== undefined ? input.description : existing.description,
      longDescription: input.longDescription !== undefined ? input.longDescription : existing.longDescription,
      price: input.price ?? existing.price,
      discountedPrice: input.discountedPrice ?? existing.discountedPrice,
      discountPercentage: computeDiscountPercentage(
        input.price ?? existing.price,
        input.discountedPrice ?? existing.discountedPrice,
      ),
      gender: input.gender !== undefined ? input.gender : existing.gender,
      fitType: input.fitType !== undefined ? input.fitType : existing.fitType,
      season: input.season !== undefined ? input.season : existing.season,
      material: input.material !== undefined ? input.material : existing.material,
      occasion: input.occasion !== undefined ? input.occasion : existing.occasion,
      pattern: input.pattern !== undefined ? input.pattern : existing.pattern,
      imageUrl: input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl,
      imageKey: input.imageKey !== undefined ? input.imageKey : existing.imageKey,
      imageUrl1: input.imageUrl1 !== undefined ? input.imageUrl1 : existing.imageUrl1,
      imageKey1: input.imageKey1 !== undefined ? input.imageKey1 : existing.imageKey1,
      imageUrl2: input.imageUrl2 !== undefined ? input.imageUrl2 : existing.imageUrl2,
      imageKey2: input.imageKey2 !== undefined ? input.imageKey2 : existing.imageKey2,
      imageUrl3: input.imageUrl3 !== undefined ? input.imageUrl3 : existing.imageUrl3,
      imageKey3: input.imageKey3 !== undefined ? input.imageKey3 : existing.imageKey3,
      returnPolicy: input.returnPolicy !== undefined ? input.returnPolicy : existing.returnPolicy,
      categoryId: input.categoryId ?? existing.categoryId,
      brandId: input.brandId !== undefined ? input.brandId : existing.brandId,
    },
    include: productInclude,
  }) as Promise<ProductWithRelations>;

export const softDeleteProduct = (productId: string) =>
  prisma.product.update({ where: { productId }, data: { isDeleted: true } });

export const toggleProductDisableDb = (productId: string, isDisabled: boolean): Promise<ToggleProductResult> =>
  prisma.product.update({
    where: { productId },
    data: { isDisabled },
    select: { productId: true, isDisabled: true },
  });

// ─── Variant queries ──────────────────────────────────────────────────────────

export const findVariantById = (variantId: string, productId: string): Promise<ProductVariant | null> =>
  prisma.productVariant.findFirst({ where: { variantId, productId } });

export const findVariantBySku = (sku: string): Promise<ProductVariant | null> =>
  prisma.productVariant.findUnique({ where: { sku } });

// Which of the given SKUs already exist (SKU is globally unique) — used to
// pre-check inline variant SKUs when creating a product.
export const findExistingSkus = (skus: string[]): Promise<string[]> =>
  prisma.productVariant
    .findMany({ where: { sku: { in: skus } }, select: { sku: true } })
    .then((rows) => rows.map((r) => r.sku));

export const countOrderItemsForVariant = (variantId: string): Promise<number> =>
  prisma.orderItem.count({ where: { variantId } });

// ─── Variant mutations ────────────────────────────────────────────────────────

export const createVariant = (productId: string, input: CreateVariantInput): Promise<ProductVariant> =>
  prisma.productVariant.create({
    data: {
      productId,
      size: input.size,
      color: input.color,
      colorCode: input.colorCode ?? null,
      sku: input.sku,
      stock: input.stock ?? 0,
      price: input.price ?? null,
      isActive: input.isActive ?? true,
    },
  });

export const updateVariantDb = (
  variantId: string,
  input: UpdateVariantInput,
  existing: Awaited<ReturnType<typeof findVariantById>> & object,
): Promise<ProductVariant> =>
  prisma.productVariant.update({
    where: { variantId },
    data: {
      size: input.size ?? existing.size,
      color: input.color ?? existing.color,
      colorCode: input.colorCode !== undefined ? input.colorCode : existing.colorCode,
      sku: input.sku ?? existing.sku,
      stock: input.stock ?? existing.stock,
      price: input.price !== undefined ? input.price : existing.price,
      isActive: input.isActive ?? existing.isActive,
    },
  });

export const deleteVariantDb = (variantId: string) =>
  prisma.productVariant.delete({ where: { variantId } });

export const countActiveProducts = (): Promise<number> =>
  prisma.product.count({ where: { isDeleted: false, isDisabled: false } });

export const countActiveVariantsWithStock = (): Promise<number> =>
  prisma.productVariant.count({ where: { isActive: true, stock: { gt: 0 } } });
