import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axiosInstance";

export const sendVerificationOtp = createAsyncThunk(
  "auth/sendVerificationOtp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/sendVerificationOtp", { email }, {
        params: { email }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    }
  }
);

// Bug #1 fix: email goes in the URL path, not the body
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/auth/verifyOtp/${encodeURIComponent(email)}`,
        { otp: Number(otp) },
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    }
  }
);

// Bug #3: Login OTP endpoints
export const sendLoginOtp = createAsyncThunk(
  "auth/sendLoginOtp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login/otp/send", {}, {
        params: { email },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send login OTP. Please try again."
      );
    }
  }
);

export const verifyLoginOtp = createAsyncThunk(
  "auth/verifyLoginOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/auth/login/otp/verify/${encodeURIComponent(email)}`,
        { otp: Number(otp) },
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ fullName, mobile, email }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", {
        fullName,
        mobile,
        email,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch user profile."
      );
    }
  }
);

export const refreshSession = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/refresh");
      return response.data;
    } catch (err) {
      return rejectWithValue("Session expired");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem("hoh_user")) || null,
  accessToken: localStorage.getItem("hoh_token") || null,
  isAuthenticated: Boolean(localStorage.getItem("hoh_token")),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      if (user) localStorage.setItem("hoh_user", JSON.stringify(user));
      if (accessToken) localStorage.setItem("hoh_token", accessToken);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("hoh_user");
      localStorage.removeItem("hoh_token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Verification OTP
      .addCase(sendVerificationOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendVerificationOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(sendVerificationOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify OTP (sign-up verify — only returns a message, no login)
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        // Bug #4 fix: this endpoint only returns { message }, no user/token.
        // The dead if(user && accessToken) check has been removed.
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Send Login OTP
      .addCase(sendLoginOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendLoginOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(sendLoginOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Login OTP — this one DOES return user + accessToken
      .addCase(verifyLoginOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const { user, accessToken } = action.payload.data || action.payload;
        if (user && accessToken) {
          state.user = user;
          state.accessToken = accessToken;
          state.isAuthenticated = true;
          localStorage.setItem("hoh_user", JSON.stringify(user));
          localStorage.setItem("hoh_token", accessToken);
        }
      })
      .addCase(verifyLoginOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const { user, accessToken } = action.payload.data || action.payload;
        if (user && accessToken) {
          state.user = user;
          state.accessToken = accessToken;
          state.isAuthenticated = true;
          localStorage.setItem("hoh_user", JSON.stringify(user));
          localStorage.setItem("hoh_token", accessToken);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch User Profile
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        const user = action.payload.data || action.payload;
        if (user) {
          state.user = user;
          localStorage.setItem("hoh_user", JSON.stringify(user));
        }
      })
      // Refresh
      .addCase(refreshSession.fulfilled, (state, action) => {
        const { accessToken } = action.payload.data || action.payload;
        if (accessToken) {
          state.accessToken = accessToken;
          localStorage.setItem("hoh_token", accessToken);
        }
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem("hoh_user");
        localStorage.removeItem("hoh_token");
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem("hoh_user");
        localStorage.removeItem("hoh_token");
      });
  },
});

export const { setCredentials, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
