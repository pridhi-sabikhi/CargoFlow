import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Shipment from "../models/Shipment.js";
import { extractIndianState } from "../utils/extractState.js";

dotenv.config();

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const dateStart = new Date("2025-12-01T00:00:00.000Z");
const dateEnd = new Date("2026-06-30T23:59:59.999Z");

const sampleShipments = [
  {
    userName: "Aman Verma",
    address: "Sector 62, Noida, Uttar Pradesh, India",
    country: "India",
    referralSource: "Organic Search",
    productName: "Bluetooth Speaker",
    category: "Electronics",
    quantity: 2,
    amount: 4999,
    status: "Delivered",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("Sector 62, Noida, Uttar Pradesh, India")
  },
  {
    userName: "Neha Sharma",
    address: "Andheri East, Mumbai, Maharashtra, India",
    country: "India",
    referralSource: "Social Media",
    productName: "Running Shoes",
    category: "Fashion",
    quantity: 1,
    amount: 2899,
    status: "In Transit",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("Andheri East, Mumbai, Maharashtra, India")
  },
  {
    userName: "Rohit Rao",
    address: "Koramangala, Bengaluru, Karnataka, India",
    country: "India",
    referralSource: "Referral",
    productName: "Kitchen Mixer",
    category: "Home",
    quantity: 1,
    amount: 6999,
    status: "Processing",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("Koramangala, Bengaluru, Karnataka, India")
  },
  {
    userName: "Priya Nair",
    address: "Anna Nagar, Chennai, Tamil Nadu, India",
    country: "India",
    referralSource: "Email",
    productName: "Face Serum",
    category: "Beauty",
    quantity: 3,
    amount: 1797,
    status: "Delivered",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("Anna Nagar, Chennai, Tamil Nadu, India")
  },
  {
    userName: "Karan Mehta",
    address: "Banjara Hills, Hyderabad, Telangana, India",
    country: "India",
    referralSource: "Direct",
    productName: "Cricket Kit",
    category: "Sports",
    quantity: 1,
    amount: 5599,
    status: "Shipped",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("Banjara Hills, Hyderabad, Telangana, India")
  },
  {
    userName: "Sanya Bhat",
    address: "Vastrapur, Ahmedabad, Gujarat, India",
    country: "India",
    referralSource: "Ads",
    productName: "Smart Watch",
    category: "Electronics",
    quantity: 1,
    amount: 8999,
    status: "Pending",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("Vastrapur, Ahmedabad, Gujarat, India")
  },
  {
    userName: "Isha Singh",
    address: "Connaught Place, New Delhi, Delhi, India",
    country: "India",
    referralSource: "Organic Search",
    productName: "Handbag",
    category: "Fashion",
    quantity: 2,
    amount: 4398,
    status: "Delivered",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("Connaught Place, New Delhi, Delhi, India")
  },
  {
    userName: "Gaurav Jain",
    address: "Park Street, Kolkata, West Bengal, India",
    country: "India",
    referralSource: "Referral",
    productName: "Air Purifier",
    category: "Home",
    quantity: 1,
    amount: 11499,
    status: "In Transit",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("Park Street, Kolkata, West Bengal, India")
  },
  {
    userName: "Harsh Vyas",
    address: "Vaishali Nagar, Jaipur, Rajasthan, India",
    country: "India",
    referralSource: "Social Media",
    productName: "Football Shoes",
    category: "Sports",
    quantity: 1,
    amount: 3299,
    status: "Delivered",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("Vaishali Nagar, Jaipur, Rajasthan, India")
  },
  {
    userName: "Anita Joseph",
    address: "Kakkanad, Kochi, Kerala, India",
    country: "India",
    referralSource: "Email",
    productName: "Hair Dryer",
    category: "Beauty",
    quantity: 2,
    amount: 2598,
    status: "Shipped",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("Kakkanad, Kochi, Kerala, India")
  },
  {
    userName: "Manpreet Kaur",
    address: "Sector 17, Chandigarh, Punjab, India",
    country: "India",
    referralSource: "Direct",
    productName: "Bluetooth Earbuds",
    category: "Electronics",
    quantity: 2,
    amount: 3998,
    status: "Processing",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("Sector 17, Chandigarh, Punjab, India")
  },
  {
    userName: "Rakesh Yadav",
    address: "DLF Cyber City, Gurugram, Haryana, India",
    country: "India",
    referralSource: "Ads",
    productName: "Backpack",
    category: "Fashion",
    quantity: 1,
    amount: 1899,
    status: "Pending",
    orderDate: randomDate(dateStart, dateEnd),
    state: extractIndianState("DLF Cyber City, Gurugram, Haryana, India")
  }
];

async function runSeed() {
  try {
    await connectDB();
    await Shipment.deleteMany({});
    await Shipment.insertMany(sampleShipments);
    console.log(`Seed complete. Inserted ${sampleShipments.length} shipments.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

runSeed();
