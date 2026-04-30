import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendPasswordResetMail } from "../utils/mailer.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
const ALLOWED_ROLES = new Set(["admin", "user", "driver"]);
const COMMON_EMAIL_TYPOS = new Set([
  "gamil.com",
  "gmial.com",
  "yaho.com",
  "yaahoo.com",
  "outlok.com",
  "hotnail.com"
]);
const EMAIL_DOMAIN_REGEX = /^(?=.{4,255}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

function normalizeRole(role) {
  // Keep compatibility with older stored roles.
  if (role === "customer") return "user";
  if (role === "manager") return "admin";
  return role;
}

function isValidEmailForAuth(email) {
  if (!EMAIL_REGEX.test(email)) return false;
  const domain = email.split("@")[1]?.toLowerCase() || "";
  if (!domain || COMMON_EMAIL_TYPOS.has(domain)) return false;
  return EMAIL_DOMAIN_REGEX.test(domain);
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
  );
}

export async function signUp(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const normalizedRole = normalizeRole(role || "user");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isValidEmailForAuth(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address (e.g., gmail.com, yahoo.com)." });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: "Password must have 12+ chars, 1 uppercase, 1 digit, and 1 special char."
      });
    }

    if (!ALLOWED_ROLES.has(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function signIn(req, res) {
  try {
    const { email, password, role } = req.body;
    const requestedRole = normalizeRole(role);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isValidEmailForAuth(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address (e.g., gmail.com, yahoo.com)." });
    }
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const effectiveUserRole = normalizeRole(user.role);
    if (requestedRole && effectiveUserRole !== requestedRole) {
      return res.status(403).json({ message: `This account is not allowed for ${requestedRole} login.` });
    }

    const token = signAccessToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: effectiveUserRole
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isValidEmailForAuth(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address (e.g., gmail.com, yahoo.com)." });
    }
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        message: "If this email is registered, a reset link has been sent."
      });
    }

    const resetToken = jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        type: "password_reset"
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_RESET_EXPIRES_IN || "15m" }
    );

    const resetPath = `/reset-password?token=${encodeURIComponent(resetToken)}`;
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${baseUrl}${resetPath}`;

    await sendPasswordResetMail({ to: user.email, resetLink });

    return res.status(200).json({
      message: "If this email is registered, a reset link has been sent."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send reset mail. Check SMTP settings.",
      error: error.message
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        message: "Password must have 12+ chars, 1 uppercase, 1 digit, and 1 special char."
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Reset token is invalid or expired." });
    }

    if (payload.type !== "password_reset") {
      return res.status(400).json({ message: "Invalid reset token." });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getMe(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Token is invalid or expired." });
    }

    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user || !user.isActive) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
