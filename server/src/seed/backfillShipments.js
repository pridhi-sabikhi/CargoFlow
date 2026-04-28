import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Shipment from "../models/Shipment.js";
import { extractIndianState } from "../utils/extractState.js";

dotenv.config();

const states = [
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
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomState() {
  return states[Math.floor(Math.random() * states.length)];
}

async function run() {
  try {
    await connectDB();

    const start = new Date("2025-12-01T00:00:00.000Z");
    const end = new Date("2026-06-30T23:59:59.999Z");
    const shipments = await Shipment.find({});

    for (const shipment of shipments) {
      const derivedState = extractIndianState(shipment.address || "");
      shipment.state = derivedState && derivedState !== "Other" ? derivedState : randomState();
      shipment.orderDate = randomDate(start, end);
      await shipment.save();
    }

    console.log(`Backfilled ${shipments.length} shipments with state and random order dates.`);
    process.exit(0);
  } catch (error) {
    console.error("Backfill failed:", error.message);
    process.exit(1);
  }
}

run();
