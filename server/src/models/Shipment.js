import mongoose from "mongoose";
import { extractIndianState } from "../utils/extractState.js";

function generatePrefixedId(prefix) {
  const token = new mongoose.Types.ObjectId().toString().slice(-8).toUpperCase();
  return `${prefix}-${token}`;
}

const INDIAN_STATES = [
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Delhi",
  "Telangana",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Rajasthan",
  "Kerala",
  "Punjab",
  "Haryana"
];

function getRandomState() {
  return INDIAN_STATES[Math.floor(Math.random() * INDIAN_STATES.length)];
}

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: { type: String, unique: true, default: () => generatePrefixedId("CF") },
    customerId: { type: String, unique: true, default: () => generatePrefixedId("CUS") },
    userName: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String },
    country: { type: String, default: "India" },
    referralSource: {
      type: String,
      enum: ["Direct", "Organic Search", "Social Media", "Referral", "Email", "Ads", "Other"],
      default: "Direct"
    },

    productName: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Fashion", "Home", "Beauty", "Sports", "Other"]
    },

    quantity: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "In Transit"],
      default: "Pending"
    },

    orderDate: { type: Date, default: Date.now },
    deliveredAt: { type: Date }
  },
  { timestamps: true }
);

shipmentSchema.pre("save", function () {
  if (!this.shipmentId) {
    this.shipmentId = generatePrefixedId("CF");
  }

  if (!this.customerId) {
    this.customerId = generatePrefixedId("CUS");
  }

  if (!this.state || this.isModified("address")) {
    const derivedState = extractIndianState(this.address);
    this.state = derivedState && derivedState !== "Other" ? derivedState : getRandomState();
  }
});

const Shipment = mongoose.model("Shipment", shipmentSchema);
export default Shipment;