import express from "express";
import { getDashboardSummary, createShipment, getShipments, updateShipmentStatus } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", getDashboardSummary);
router.get("/shipments", getShipments);
router.post("/shipments", createShipment);
router.patch("/shipments/:shipmentId/status", updateShipmentStatus);

export default router;