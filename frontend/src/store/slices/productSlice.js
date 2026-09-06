import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as productService from "../../services/productService";

/**
 * Helper utility for Fisher-Yates shuffle
 */
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Fetch home page products grouped by category
export const fetchHomeProducts = createAsyncThunk(
  "product/fetchHomeProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.fetchProductsGroupedByCategory();
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch home products."
      );
    }
  }
);

// Fetch all products (paginated)
export const fetchAllProducts = createAsyncThunk(
  "product/fetchAllProducts",
  async (
    { page = 1, limit = 12, sortBy = "newest", append = false } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await productService.fetchProducts({ page, limit, sortBy });
      const data = response.data || response;
      return { ...data, append };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch products."
      );
    }
  }
);

// Fetch products by category (with fallback keyword search if empty)
export const fetchProductsByCategory = createAsyncThunk(
  "product/fetchProductsByCategory",
  async (
    { categoryId, categoryName, page = 1, limit = 12, sortBy = "newest", append = false },
    { rejectWithValue }
  ) => {
    try {
      let response;
      if (categoryId) {
        response = await productService.fetchProductsByCategory(categoryId, { page, limit, sortBy });
      }

      let data = response?.data || response;

      // Fallback: If products array is empty for categoryId, search by category keyword
      if ((!data || !data.products || data.products.length === 0) && categoryName) {
        const rawName = categoryName.split(" ")[0];
        const keyword = rawName.endsWith("s") && rawName.length > 5 ? rawName.slice(0, -1) : rawName;
        const searchRes = await productService.searchProducts({ keyword, page, limit, sortBy });
        data = searchRes.data || searchRes;
      }

      return { ...data, append };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch category products."
      );
    }
  }
);

// Fetch single product details by ID
export const fetchProductDetail = createAsyncThunk(
  "product/fetchProductDetail",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productService.fetchProductById(productId);
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch product details."
      );
    }
  }
);

// Search products by keyword
export const searchProductsAction = createAsyncThunk(
  "product/searchProductsAction",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.searchProducts(params);
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to search products."
      );
    }
  }
);

// Fetch best-selling products ranked by units sold
export const fetchBestSelling = createAsyncThunk(
  "product/fetchBestSelling",
  async ({ limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await productService.fetchBestSellingProducts({ limit });
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch best-selling products."
      );
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  // Home page grouped products
  homeGroupedProducts: [],
  homeShuffledProducts: [],
  homeLoading: false,
  homeError: null,

  // Best selling products
  bestSellingProducts: [],
  bestSellingLoading: false,
  bestSellingError: null,

  // All products
  allProducts: [],
  allProductsPagination: { page: 1, totalPages: 1, total: 0, limit: 12 },
  allProductsLoading: false,
  allProductsError: null,


  // Category page products
  categoryProducts: [],
  categoryPagination: { page: 1, totalPages: 1, total: 0, limit: 12 },
  categoryLoading: false,
  categoryError: null,

  // Single product detail
  productDetail: null,
  productDetailLoading: false,
  productDetailError: null,

  // Search results
  searchResults: [],
  searchLoading: false,
  searchError: null,
};

// ─── Product Slice ────────────────────────────────────────────────────────────

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    shuffleHomeProducts: (state) => {
      if (state.homeShuffledProducts.length > 0) {
        state.homeShuffledProducts = shuffleArray(state.homeShuffledProducts);
      }
    },
    clearProductDetail: (state) => {
      state.productDetail = null;
      state.productDetailError = null;
    },
    clearCategoryProducts: (state) => {
      state.categoryProducts = [];
      state.categoryPagination = { page: 1, totalPages: 1, total: 0, limit: 12 };
      state.categoryError = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── fetchHomeProducts ───
      .addCase(fetchHomeProducts.pending, (state) => {
        state.homeLoading = true;
        state.homeError = null;
      })
      .addCase(fetchHomeProducts.fulfilled, (state, action) => {
        state.homeLoading = false;
        state.homeGroupedProducts = action.payload || [];
        if (state.homeShuffledProducts.length === 0) {
          const flatProducts = (action.payload || []).flatMap((g) => g.products || []);
          state.homeShuffledProducts = shuffleArray(flatProducts);
        }
      })
      .addCase(fetchHomeProducts.rejected, (state, action) => {
        state.homeLoading = false;
        state.homeError = action.payload;
      })

      // ─── fetchAllProducts ───
      .addCase(fetchAllProducts.pending, (state) => {
        state.allProductsLoading = true;
        state.allProductsError = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.allProductsLoading = false;
        const { products, total, page, limit, totalPages, append } = action.payload || {};
        if (append) {
          state.allProducts = [...state.allProducts, ...(products || [])];
        } else {
          state.allProducts = products || [];
        }
        state.allProductsPagination = {
          page: page || 1,
          totalPages: totalPages || 1,
          total: total || 0,
          limit: limit || 12,
        };
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.allProductsLoading = false;
        state.allProductsError = action.payload;
      })

      // ─── fetchProductsByCategory ───
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.categoryLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.categoryLoading = false;
        const { products, total, page, limit, totalPages, append } = action.payload || {};
        if (append) {
          state.categoryProducts = [...state.categoryProducts, ...(products || [])];
        } else {
          state.categoryProducts = products || [];
        }
        state.categoryPagination = {
          page: page || 1,
          totalPages: totalPages || 1,
          total: total || 0,
          limit: limit || 12,
        };
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload;
      })

      // ─── fetchProductDetail ───
      .addCase(fetchProductDetail.pending, (state) => {
        state.productDetailLoading = true;
        state.productDetailError = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.productDetailLoading = false;
        state.productDetail = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.productDetailLoading = false;
        state.productDetailError = action.payload;
      })

      // ─── searchProductsAction ───
      .addCase(searchProductsAction.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchProductsAction.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload?.products || action.payload || [];
      })
      .addCase(searchProductsAction.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      })

      // ─── fetchBestSelling ───
      .addCase(fetchBestSelling.pending, (state) => {
        state.bestSellingLoading = true;
        state.bestSellingError = null;
      })
      .addCase(fetchBestSelling.fulfilled, (state, action) => {
        state.bestSellingLoading = false;
        // payload can be array of products or wrapped in data
        state.bestSellingProducts = Array.isArray(action.payload) ? action.payload : action.payload?.products || action.payload?.data || [];
      })
      .addCase(fetchBestSelling.rejected, (state, action) => {
        state.bestSellingLoading = false;
        state.bestSellingError = action.payload;
      });
  },
});


export const {
  shuffleHomeProducts,
  clearProductDetail,
  clearCategoryProducts,
  clearSearchResults,
} = productSlice.actions;

export default productSlice.reducer;
