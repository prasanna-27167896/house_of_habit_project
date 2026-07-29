import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartService from "../../services/cartService";
import DummyImage from "../../assets/images/dummy-model.png";

/**
 * Format raw backend CartItem object into component-friendly object
 * without losing any backend property.
 */
export const formatCartItem = (item) => {
  if (!item) return null;
  const variant = item.variant || {};
  const product = variant.product || {};

  const unitPrice = variant.price ?? product.discountedPrice ?? product.price ?? item.price ?? 0;
  const origPrice = product.price ?? item.originalPrice ?? unitPrice;
  const discPercent =
    (product.discountPercentage && product.discountPercentage > 0) ? product.discountPercentage :
      (item.discount && item.discount > 0) ? item.discount :
        (origPrice > unitPrice ? Math.round(((origPrice - unitPrice) / origPrice) * 100) : 0);

  return {
    ...item,
    id: item.cartItemId || item.id,
    cartItemId: item.cartItemId || item.id,
    variantId: variant.variantId || item.variantId,
    name: product.title || item.name || item.title || "Product",
    title: product.title || item.title || item.name || "Product",
    image: product.imageUrl || item.image || DummyImage,
    size: variant.size || item.size || "S",
    color: variant.color || item.color || "",
    quantity: item.quantity || 1,
    price: unitPrice,
    originalPrice: origPrice,
    discount: discPercent,
    isAvailable: item.isAvailable !== false,
  };
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Fetch Cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      const data = response.data || response;
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch cart."
      );
    }
  }
);

// Add to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ variantId, quantity = 1 }, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(variantId, quantity);
      // Re-fetch cart to update full cart state and subtotal
      dispatch(fetchCart());
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add item to cart."
      );
    }
  }
);

// Update Cart Item Quantity
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ cartItemId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(cartItemId, quantity);
      dispatch(fetchCart());
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update item quantity."
      );
    }
  }
);

// Remove Cart Item
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (cartItemId, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(cartItemId);
      dispatch(fetchCart());
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove item from cart."
      );
    }
  }
);

// Clear Cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      dispatch(fetchCart());
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to clear cart."
      );
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  cartId: null,
  items: [],
  subtotal: 0,
  totalItems: 0,
  hasUnavailableItems: false,
  isLoading: false,
  error: null,
  addingVariants: [],
  updatingItems: [],
  deletingItems: [],
};

// ─── Cart Slice ───────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.cartId = null;
      state.items = [];
      state.subtotal = 0;
      state.totalItems = 0;
      state.hasUnavailableItems = false;
      state.isLoading = false;
      state.error = null;
      state.addingVariants = [];
      state.updatingItems = [];
      state.deletingItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload || {};
        state.cartId = payload.cartId || null;
        const rawItems = payload.items || [];
        state.items = rawItems.map(formatCartItem);
        state.subtotal = payload.subtotal || 0;
        state.totalItems = payload.totalItems ?? state.items.length;
        state.hasUnavailableItems = !!payload.hasUnavailableItems;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // addToCart
      .addCase(addToCart.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        if (action.meta?.arg?.variantId) {
          state.addingVariants.push(action.meta.arg.variantId);
        }
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta?.arg?.variantId) {
          state.addingVariants = state.addingVariants.filter(id => id !== action.meta.arg.variantId);
        }
        // Optimistically increment totalItems by 1 if it is a new item/variant
        const hasVariant = state.items.some(i => i.variantId === action.meta?.arg?.variantId);
        if (!hasVariant) {
          state.totalItems += 1;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        if (action.meta?.arg?.variantId) {
          state.addingVariants = state.addingVariants.filter(id => id !== action.meta.arg.variantId);
        }
      })

      // updateCartItem
      .addCase(updateCartItem.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        if (action.meta?.arg?.cartItemId) {
          state.updatingItems.push(action.meta.arg.cartItemId);
        }
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const { cartItemId, quantity } = action.meta?.arg || {};
        if (cartItemId) {
          state.updatingItems = state.updatingItems.filter(id => id !== cartItemId);
          if (quantity !== undefined) {
            const updatedItem = state.items.find(i => i.id === cartItemId);
            if (updatedItem) {
              const diff = quantity - updatedItem.quantity;
              updatedItem.quantity = quantity;
              state.subtotal = Math.max(0, state.subtotal + (updatedItem.price * diff));
            }
          }
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        if (action.meta?.arg?.cartItemId) {
          state.updatingItems = state.updatingItems.filter(id => id !== action.meta.arg.cartItemId);
        }
      })

      // removeFromCart
      .addCase(removeFromCart.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        if (action.meta?.arg) {
          state.deletingItems.push(action.meta.arg);
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const cartItemId = action.meta?.arg;
        if (cartItemId) {
          state.deletingItems = state.deletingItems.filter(id => id !== cartItemId);
          // Optimistically remove item from items list, subtotal, and totalItems immediately
          const deletedItem = state.items.find(i => i.id === cartItemId);
          if (deletedItem) {
            state.totalItems = Math.max(0, state.totalItems - 1);
            state.subtotal = Math.max(0, state.subtotal - (deletedItem.price * deletedItem.quantity));
            state.items = state.items.filter(i => i.id !== cartItemId);
          }
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        if (action.meta?.arg) {
          state.deletingItems = state.deletingItems.filter(id => id !== action.meta.arg);
        }
      })

      // clearCart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.subtotal = 0;
        state.totalItems = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
