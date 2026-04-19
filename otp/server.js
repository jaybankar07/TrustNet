require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ status: "OTP Microservice is running on Vercel!" });
});

// Initialize Twilio client
const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

// Simple in-memory store for OTPs (in production, use a database or Redis)
const otpStore = {};

// Send OTP Endpoint
app.post("/send-otp", async (req, res) => {
  let { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, msg: "Phone number is required" });
  }

  // Ensure E.164 formatting (assuming +91 for Indian numbers if a 10-digit raw number is provided)
  if (phone.length === 10 && !phone.startsWith("+")) {
    phone = "+91" + phone;
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = otp;
  console.log("OTP:", otp); // Keep the original log for debugging

  try {
    // Send SMS via Twilio
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });
    res.json({ success: true, msg: "OTP sent successfully" });
  } catch (err) {
    console.error("Twilio Error:", err.message);
    res.status(400).json({ success: false, msg: err.message });
  }
});

// Verify OTP Endpoint
app.post("/verify-otp", (req, res) => {
  let { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, msg: "Phone number and OTP are required" });
  }

  // Ensure E.164 formatting to match how it was stored
  if (phone.length === 10 && !phone.startsWith("+")) {
    phone = "+91" + phone;
  }

  // Check if OTP matches
  if (otpStore[phone] === otp) {
    // Remove the OTP from store after successful verification
    delete otpStore[phone];
    res.json({ success: true, msg: "OTP verified successfully" });
  } else {
    res.status(400).json({ success: false, msg: "Invalid OTP" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Export for Vercel Serverless
module.exports = app;