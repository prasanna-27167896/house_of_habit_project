import * as brandRepo from "@repos/brand.repo";
import * as categoryRepo from "@repos/category.repo";
import { Errors } from "@errors/index";
import { deleteFromPublicR2 } from "@services/cloudflare.service";
import type { BrandWithCategory } from "@interfaces/brand.types";
import type { CreateBrandInput, UpdateBrandInput } from "@validators/brand.schema";

export const createBrand = async (input: CreateBrandInput): Promise<BrandWithCategory> => {
  if (input.categoryId !== undefined) {
    const cat = await categoryRepo.findCategoryById(input.categoryId);
    if (!cat) throw Errors.CATEGORY_NOT_FOUND();
  }

  return brandRepo.createBrand({
    brandName: input.brandName,
    brandCode: input.brandCode ?? null,
    status: input.status ?? "ACTIVE",
    categoryId: input.categoryId ?? null,
    imageUrl: input.imageUrl ?? null,
    imageKey: input.imageKey ?? null,
  });
};

export const getAllBrands = async (): Promise<BrandWithCategory[]> =>
  brandRepo.findAllBrands();

export const getBrandsByCategory = async (categoryId: string): Promise<BrandWithCategory[]> => {
  const cat = await categoryRepo.findCategoryById(categoryId);
  if (!cat) throw Errors.CATEGORY_NOT_FOUND();

  return brandRepo.findBrandsByCategoryId(categoryId);
};

export const getBrandById = async (brandId: string): Promise<BrandWithCategory> => {
  const brand = await brandRepo.findBrandById(brandId);
  if (!brand) throw Errors.BRAND_NOT_FOUND();
  return brand;
};

export const updateBrand = async (brandId: string, input: UpdateBrandInput): Promise<BrandWithCategory> => {
  const brand = await brandRepo.findBrandById(brandId);
  if (!brand) throw Errors.BRAND_NOT_FOUND();

  if (input.categoryId) {
    const cat = await categoryRepo.findCategoryById(input.categoryId);
    if (!cat) throw Errors.CATEGORY_NOT_FOUND();
  }

  // Decide whether the old image is now orphaned (no other brand uses it), but delete it
  // only AFTER the DB update succeeds — deletion is irreversible, so doing it first would
  // leave the brand pointing at a missing object if the update failed.
  let oldImageKeyToDelete: string | null = null;
  if (input.imageKey && input.imageKey !== brand.imageKey && brand.imageKey) {
    const otherCount = await brandRepo.countBrandsByImageKey(brand.imageKey, brandId);
    if (otherCount === 0) oldImageKeyToDelete = brand.imageKey;
  }

  const updated = await brandRepo.updateBrand(brandId, {
    brandName: input.brandName ?? brand.brandName,
    brandCode: input.brandCode !== undefined ? input.brandCode : brand.brandCode,
    status: input.status ?? brand.status ?? "ACTIVE",
    categoryId: input.categoryId !== undefined ? (input.categoryId ?? null) : (brand.categoryId ?? null),
    imageUrl: input.imageUrl !== undefined ? input.imageUrl : brand.imageUrl,
    imageKey: input.imageKey !== undefined ? input.imageKey : brand.imageKey,
  });

  if (oldImageKeyToDelete) await deleteFromPublicR2(oldImageKeyToDelete).catch(() => undefined);

  return updated;
};

export const deleteBrand = async (brandId: string): Promise<{ affectedProducts: number }> => {
  const brand = await brandRepo.findBrandById(brandId);
  if (!brand) throw Errors.BRAND_NOT_FOUND();

  let canDeleteImage = false;
  if (brand.imageKey) {
    const otherCount = await brandRepo.countBrandsByImageKey(brand.imageKey, brandId);
    canDeleteImage = otherCount === 0;
  }

  // Detaches the brand from its products (brandId → null) and deletes it.
  const affectedProducts = await brandRepo.deleteBrandWithProducts(brandId);

  if (canDeleteImage && brand.imageKey) {
    await deleteFromPublicR2(brand.imageKey).catch(() => undefined);
  }

  return { affectedProducts };
};
