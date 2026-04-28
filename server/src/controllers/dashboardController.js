import Shipment from "../models/Shipment.js";

function getDateRange(range = "This Month") {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (range) {
    case "Today":
      break;
    case "This Week":
      start.setDate(now.getDate() - 6);
      break;
    case "This Month":
      start.setDate(1);
      break;
    case "This Year":
      start.setMonth(0, 1);
      break;
    default:
      return {};
  }

  return { $gte: start, $lte: now };
}

function buildMatch(range) {
  const orderDate = getDateRange(range);
  return Object.keys(orderDate).length ? { orderDate } : {};
}

function withMatch(match, stages) {
  return Object.keys(match).length ? [{ $match: match }, ...stages] : stages;
}

export async function getDashboardSummary(req, res) {
  try {
    const range = req.query.range || "This Month";
    const match = buildMatch(range);

    const [statsAgg] = await Shipment.aggregate(withMatch(match, [
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] }
          }
        }
      }
    ]));

    const categoriesAgg = await Shipment.aggregate(withMatch(match, [
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]));

    const statesAgg = await Shipment.aggregate(withMatch(match, [
      { $match: { country: "India" } },
      {
        $group: {
          _id: "$state",
          users: { $addToSet: "$customerId" }
        }
      },
      {
        $project: {
          _id: 1,
          count: { $size: "$users" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]));

    const monthlyAgg = await Shipment.aggregate(withMatch(match, [
      {
        $group: {
          _id: { $month: "$orderDate" },
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]));

    const referralAgg = await Shipment.aggregate(withMatch(match, [
      {
        $group: {
          _id: "$referralSource",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]));

    const recentShipments = await Shipment.find(Object.keys(match).length ? match : {})
      .sort({ orderDate: -1, createdAt: -1 })
      .limit(5)
      .lean();

    const totalReferralCount = referralAgg.reduce((sum, item) => sum + item.count, 0);

    const response = {
      stats: {
        totalSales: statsAgg?.totalSales || 0,
        totalOrders: statsAgg?.totalOrders || 0,
        deliveredOrders: statsAgg?.deliveredOrders || 0
      },
      categories: categoriesAgg.map(c => ({
        name: c._id,
        value: c.totalAmount
      })),
      statesTop6: statesAgg.map(s => ({
        state: s._id,
        users: s.count
      })),
      monthly: monthlyAgg,
      trafficSources: referralAgg.map(item => ({
        source: item._id,
        count: item.count,
        pct: totalReferralCount > 0 ? Number(((item.count / totalReferralCount) * 100).toFixed(1)) : 0
      })),
      recentOrders: recentShipments.map((shipment, index) => ({
        no: index + 1,
        id: `#${shipment.shipmentId}`,
        customerId: shipment.customerId,
        cust: shipment.userName,
        prod: shipment.productName,
        qty: shipment.quantity,
        date: new Date(shipment.orderDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short"
        }),
        st: shipment.status,
        amt: `₹${Number(shipment.amount || 0).toLocaleString("en-IN")}`
      }))
    };

    return res.json(response);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function createShipment(req, res) {
  try {
    const shipment = await Shipment.create(req.body);
    return res.status(201).json(shipment);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export async function getShipments(req, res) {
  try {
    const shipments = await Shipment.find({})
      .sort({ orderDate: -1, createdAt: -1 })
      .lean();

    return res.json(
      shipments.map((shipment, index) => ({
        no: index + 1,
        shipmentId: shipment.shipmentId,
        customerId: shipment.customerId,
        userName: shipment.userName,
        productName: shipment.productName,
        category: shipment.category,
        referralSource: shipment.referralSource,
        state: shipment.state,
        country: shipment.country,
        quantity: shipment.quantity,
        amount: shipment.amount,
        status: shipment.status,
        orderDate: shipment.orderDate,
        createdAt: shipment.createdAt
      }))
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function updateShipmentStatus(req, res) {
  try {
    const { shipmentId } = req.params;
    const { status } = req.body;

    const updatedShipment = await Shipment.findOneAndUpdate(
      { shipmentId },
      {
        status,
        ...(status === "Delivered" ? { deliveredAt: new Date() } : { deliveredAt: null })
      },
      { new: true, runValidators: true }
    );

    if (!updatedShipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    return res.json(updatedShipment);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}