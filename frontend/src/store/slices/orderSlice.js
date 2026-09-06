import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as orderService from "../../services/orderService";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Fetch customer's orders list (with filters and pagination)
export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.fetchMyOrders(params);
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch orders."
      );
    }
  }
);

// Fetch single order details
export const fetchOrderById = createAsyncThunk(
  "order/fetchOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.fetchOrderDetail(orderId);
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch order details."
      );
    }
  }
);

// Cancel an order
export const cancelUserOrder = createAsyncThunk(
  "order/cancelUserOrder",
  async ({ orderId, reason, comment }, { rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(orderId, { reason, comment });
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to cancel order."
      );
    }
  }
);

// Fetch tracking timeline for an order
export const fetchOrderTracking = createAsyncThunk(
  "order/fetchOrderTracking",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.fetchOrderTracking(orderId);
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch tracking details."
      );
    }
  }
);

// Download order invoice
export const downloadInvoice = createAsyncThunk(
  "order/downloadInvoice",
  async (orderId, { rejectWithValue }) => {
    try {
      await orderService.downloadOrderInvoice(orderId);
      return { orderId };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to download invoice."
      );
    }
  }
);

// Submit Return Request
export const submitReturn = createAsyncThunk(
  "order/submitReturn",
  async ({ orderId, orderItemId, reasonCategory, reasonDetail, comment }, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrderReturn(orderId, {
        orderItemId,
        reasonCategory,
        reasonDetail,
        comment,
      });
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to submit return request."
      );
    }
  }
);

// Submit Size Exchange Request
export const submitExchange = createAsyncThunk(
  "order/submitExchange",
  async ({ orderId, orderItemId, requestedSize, reasonCategory, reasonDetail }, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrderExchange(orderId, {
        orderItemId,
        requestedSize,
        reasonCategory,
        reasonDetail,
      });
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to submit exchange request."
      );
    }
  }
);

// Submit Delivery Feedback
export const submitDeliveryFeedback = createAsyncThunk(
  "order/submitDeliveryFeedback",
  async ({ orderId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await orderService.submitDeliveryFeedback(orderId, {
        rating,
        comment,
      });
      return response.data || response;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to submit delivery feedback."
      );
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  // Orders list & pagination
  orders: [],
  ordersPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  ordersLoading: false,
  ordersError: null,

  // Selected single order detail
  currentOrder: null,
  currentOrderLoading: false,
  currentOrderError: null,

  // Tracking data
  trackingData: null,
  trackingLoading: false,
  trackingError: null,

  // Action status (cancellation, return, exchange, feedback)
  actionLoading: false,
  actionSuccess: null,
  actionError: null,
};

// ─── Order Slice ──────────────────────────────────────────────────────────────

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.currentOrderError = null;
    },
    clearTrackingData: (state) => {
      state.trackingData = null;
      state.trackingError = null;
    },
    clearActionStatus: (state) => {
      state.actionLoading = false;
      state.actionSuccess = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── fetchOrders ───
      .addCase(fetchOrders.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        const { orders, total, page, limit, totalPages } = action.payload || {};
        state.orders = orders || [];
        state.ordersPagination = {
          page: page || 1,
          limit: limit || 10,
          total: total || 0,
          totalPages: totalPages || 1,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload;
      })

      // ─── fetchOrderById ───
      .addCase(fetchOrderById.pending, (state) => {
        state.currentOrderLoading = true;
        state.currentOrderError = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrderError = action.payload;
      })

      // ─── cancelUserOrder ───
      .addCase(cancelUserOrder.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(cancelUserOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Order cancelled successfully.";
        if (state.currentOrder && (state.currentOrder.orderId === action.payload?.orderId || state.currentOrder.id === action.payload?.orderId)) {
          state.currentOrder = { ...state.currentOrder, ...action.payload, orderStatus: "CANCELLED" };
        }
        state.orders = state.orders.map((o) =>
          o.orderId === action.payload?.orderId || o.id === action.payload?.orderId
            ? { ...o, ...action.payload, orderStatus: "CANCELLED" }
            : o
        );
      })
      .addCase(cancelUserOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // ─── fetchOrderTracking ───
      .addCase(fetchOrderTracking.pending, (state) => {
        state.trackingLoading = true;
        state.trackingError = null;
      })
      .addCase(fetchOrderTracking.fulfilled, (state, action) => {
        state.trackingLoading = false;
        state.trackingData = action.payload;
      })
      .addCase(fetchOrderTracking.rejected, (state, action) => {
        state.trackingLoading = false;
        state.trackingError = action.payload;
      })

      // ─── submitReturn ───
      .addCase(submitReturn.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(submitReturn.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = "Return request submitted successfully.";
      })
      .addCase(submitReturn.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // ─── submitExchange ───
      .addCase(submitExchange.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(submitExchange.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = "Exchange request submitted successfully.";
      })
      .addCase(submitExchange.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // ─── submitDeliveryFeedback ───
      .addCase(submitDeliveryFeedback.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(submitDeliveryFeedback.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = "Delivery feedback submitted successfully.";
      })
      .addCase(submitDeliveryFeedback.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearCurrentOrder, clearTrackingData, clearActionStatus } =
  orderSlice.actions;

export default orderSlice.reducer;
