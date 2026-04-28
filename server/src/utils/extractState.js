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

export function extractIndianState(address = "") {
  const normalized = address.toLowerCase();
  for (const s of INDIAN_STATES) {
    if (normalized.includes(s.toLowerCase())) return s;
  }
  return "Other";
}