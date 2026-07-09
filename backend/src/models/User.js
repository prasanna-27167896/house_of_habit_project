import mongoose from "mongoose";

// Delivery Address Schema
const addressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine: {
      type: String,
      required: true,
      trim: true,
    }, // House No, Building, Street, Area

    locality: {
      type: String,
      required: true,
      trim: true,
    }, // Locality / Town

    state: {
      type: String,
      required: true,
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// User Schema
const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      sparse: true,
      default: "",
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      sparse: true,
      default: "",
      trim: true,
    },

    addresses: {
      type: [addressSchema],
      default: [], // Starts empty during registration
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
