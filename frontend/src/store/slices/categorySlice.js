import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as categoryService from "../../services/categoryService";

export const fetchAllCategories = createAsyncThunk(
  "category/fetchAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.fetchCategories();
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch categories."
      );
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "category/fetchCategoryById",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await categoryService.fetchCategoryById(categoryId);
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch category details."
      );
    }
  }
);

const initialState = {
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllCategories
      .addCase(fetchAllCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchCategoryById
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;
