// server.js - UPDATED with Twilio Verify Service
// server.js - UPDATED with Twilio Verify Service
// Load .env from the same directory as server.js, not from CWD
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require("./db");

const app = express();

// ==================== CONFIG ====================
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this_secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';

// OTP Configuration
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 6;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS) || 3;

// Twilio Configuration - with detailed logging
console.log('🔍 Loading Twilio configuration from environment...');
console.log('📋 Environment variables check:');
console.log('   TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? `${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...` : 'NOT SET');
console.log('   TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? `${process.env.TWILIO_AUTH_TOKEN.substring(0, 6)}...` : 'NOT SET');
console.log('   TWILIO_VERIFY_SERVICE_SID:', process.env.TWILIO_VERIFY_SERVICE_SID ? `${process.env.TWILIO_VERIFY_SERVICE_SID.substring(0, 10)}...` : 'NOT SET');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

let twilioClient = null;
let twilioVerifyService = null;

// Initialize Twilio
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_VERIFY_SERVICE_SID) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    twilioVerifyService = twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID);
    console.log('✅ Twilio Verify Service initialized successfully');
    console.log(`📱 Account SID: ${TWILIO_ACCOUNT_SID.substring(0, 10)}...`);
    console.log(`🔐 Auth Token: ${TWILIO_AUTH_TOKEN.substring(0, 6)}...`);
    console.log(`📞 Verify Service SID: ${TWILIO_VERIFY_SERVICE_SID.substring(0, 10)}...`);
  } catch (error) {
    console.log('⚠️ Twilio initialization failed:', error.message);
    console.log('📝 Falling back to console OTP mode');
  }
} else {
  console.log('⚠️ Twilio not configured - OTP will be logged to console');
  console.log('❌ Missing credentials:');
  if (!TWILIO_ACCOUNT_SID) console.log('   - TWILIO_ACCOUNT_SID is missing');
  if (!TWILIO_AUTH_TOKEN) console.log('   - TWILIO_AUTH_TOKEN is missing');
  if (!TWILIO_VERIFY_SERVICE_SID) console.log('   - TWILIO_VERIFY_SERVICE_SID is missing');
  console.log('');
  console.log('🔧 FIX: Make sure .env file exists in project root with these variables');
}

// ==================== MIDDLEWARE SETUP ====================
// CORS - allow all origins for debugging
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Additional CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '200kb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  console.log(`📍 [ROUTE] ${req.method} ${req.originalUrl}`);
  next();
});

// ==================== JWT HELPERS ====================
function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

async function authenticateMiddleware(req, res, next) {
  try {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Missing token' });

    const payload = verifyJwt(token);
    if (!payload || !payload.id) return res.status(401).json({ success: false, error: 'Invalid token' });

    const [rows] = await db.execute('SELECT id, dealer_code, dealer_name, email, is_active FROM users WHERE id = ?', [payload.id]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const user = rows[0];
    if (user.is_active === 0) {
      return res.status(403).json({ success: false, error: 'Account disabled' });
    }

    req.user = {
      id: user.id,
      dealerCode: user.dealer_code,
      dealerName: user.dealer_name,
      email: user.email
    };

    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
}

// ==================== OTP HELPER FUNCTIONS ====================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPViaTwilioVerify(mobileNo) {
  if (!twilioVerifyService) {
    throw new Error('Twilio Verify Service not initialized');
  }

  try {
    const verification = await twilioVerifyService.verifications.create({
      to: `+91${mobileNo}`,
      channel: 'sms'
    });
    
    console.log('✅ OTP sent via Twilio Verify');
    console.log('📊 Verification Status:', verification.status);
    console.log('📱 To:', verification.to);
    
    return {
      success: true,
      status: verification.status,
      to: verification.to
    };
  } catch (error) {
    console.error('❌ Twilio Verify error:', error.message);
    if (error.code === 60200) {
      throw new Error('Invalid phone number format');
    } else if (error.code === 60203) {
      throw new Error('Max send attempts reached for this number');
    } else if (error.code === 60212) {
      throw new Error('Too many requests. Please try again later.');
    }
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
}

async function verifyOTPViaTwilioVerify(mobileNo, otp) {
  if (!twilioVerifyService) {
    throw new Error('Twilio Verify Service not initialized');
  }

  try {
    const verificationCheck = await twilioVerifyService.verificationChecks.create({
      to: `+91${mobileNo}`,
      code: otp
    });
    
    console.log('🔍 Verification Check Status:', verificationCheck.status);
    
    return {
      success: verificationCheck.status === 'approved',
      status: verificationCheck.status
    };
  } catch (error) {
    console.error('❌ Twilio Verify check error:', error.message);
    if (error.code === 60202) {
      throw new Error('Max check attempts reached');
    }
    throw new Error(`Verification failed: ${error.message}`);
  }
}

// Fallback console OTP for development
async function sendOTPConsole(mobileNo, otp) {
  console.log('='.repeat(60));
  console.log('📱 DEVELOPMENT MODE - OTP');
  console.log('='.repeat(60));
  console.log(`Mobile: ${mobileNo}`);
  console.log(`OTP: ${otp}`);
  console.log(`Expires in: ${OTP_EXPIRY_MINUTES} minutes`);
  console.log('='.repeat(60));
  return true;
}

// ==================== BASIC ROUTES ====================
app.get("/", (req, res) => {
  res.send("✅ Server is running. Use /api/health, /api/signup, or /api/check-discount.");
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    port: PORT,
    twilioConfigured: !!twilioVerifyService
  });
});

// ==================== OTP ENDPOINTS ====================
console.log('🔧 Registering OTP endpoints...');

// Send OTP endpoint - UPDATED to use Twilio Verify
app.post("/api/send-otp", async (req, res) => {
  console.log('📨 POST /api/send-otp - Request received');
  
  try {
    const { mobileNo } = req.body;
    console.log('📱 Mobile number:', mobileNo);

    if (!mobileNo || mobileNo.length !== 10) {
      console.log('❌ Invalid mobile number');
      return res.status(400).json({
        success: false,
        error: "Valid 10-digit mobile number required"
      });
    }

    // Try to send via Twilio Verify first
    if (twilioVerifyService) {
      try {
        console.log('📤 Attempting to send OTP via Twilio Verify...');
        const result = await sendOTPViaTwilioVerify(mobileNo);
        
        if (result.success) {
          console.log('✅ OTP sent successfully via Twilio Verify');
          
          // Clean up old records
          await db.execute(
            "DELETE FROM otp_verifications WHERE mobile_no = ?",
            [mobileNo]
          );
          
          // Store minimal tracking info - Twilio manages the actual OTP
          const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
          
          await db.execute(
            `INSERT INTO otp_verifications (mobile_no, otp, expires_at, attempts, created_at, verification_method) 
             VALUES (?, ?, ?, 0, NOW(), 'twilio_verify')`,
            [mobileNo, '000000', expiresAt]  // Use '000000' as placeholder, won't be validated
          );
          
          console.log('📱 Real OTP sent via SMS to +91' + mobileNo);
          console.log('⚠️  Check your phone for the actual OTP!');
          
          return res.json({
            success: true,
            message: "OTP sent successfully via SMS to your mobile",
            expiresIn: OTP_EXPIRY_MINUTES,
            method: 'twilio_verify',
            to: result.to
          });
        }
      } catch (twilioError) {
        console.error('❌ Twilio Verify failed:', twilioError.message);
        console.log('🔄 Falling back to database OTP...');
        // Fall through to database OTP
      }
    }

    // Fallback: Database OTP with console logging
    console.log('📝 Using database OTP method');
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    console.log('🔑 Generated OTP:', otp);
    console.log('⏰ Expires at:', expiresAt.toLocaleString());

    await db.execute(
      "DELETE FROM otp_verifications WHERE mobile_no = ?",
      [mobileNo]
    );

    await db.execute(
      `INSERT INTO otp_verifications (mobile_no, otp, expires_at, attempts, created_at, verification_method) 
       VALUES (?, ?, ?, 0, NOW(), 'database')`,
      [mobileNo, otp, expiresAt]
    );

    await sendOTPConsole(mobileNo, otp);

    const response = {
      success: true,
      message: "OTP sent successfully",
      expiresIn: OTP_EXPIRY_MINUTES,
      method: 'database'
    };
    
    // Include OTP in development mode
    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
      console.log('🔧 DEV MODE: Including OTP in response');
    }
    
    console.log('✅ OTP sent successfully');
    return res.json(response);

  } catch (error) {
    console.error("❌ Send OTP error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send OTP",
      details: error.message
    });
  }
});

// Verify OTP endpoint - UPDATED to support both methods
app.post("/api/verify-otp", async (req, res) => {
  console.log('🔐 POST /api/verify-otp - Request received');
  
  try {
    const { mobileNo, otp } = req.body;
    console.log('📱 Mobile:', mobileNo, '| OTP:', otp);

    if (!mobileNo || !otp) {
      return res.status(400).json({
        success: false,
        error: "Mobile number and OTP required"
      });
    }

    if (otp.length !== OTP_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `OTP must be ${OTP_LENGTH} digits`
      });
    }

    // Check if we should use Twilio Verify
    const [records] = await db.execute(
      `SELECT * FROM otp_verifications 
       WHERE mobile_no = ? AND verified = 0
       ORDER BY created_at DESC LIMIT 1`,
      [mobileNo]
    );

    if (records.length === 0) {
      console.log('❌ No OTP record found');
      return res.status(400).json({
        success: false,
        error: "No OTP found. Please request a new OTP."
      });
    }

    const record = records[0];
    const verificationMethod = record.verification_method || 'database';
    
    console.log('📋 Verification method:', verificationMethod);

    // Use Twilio Verify if that's how it was sent
    if (verificationMethod === 'twilio_verify' && twilioVerifyService) {
      try {
        console.log('🔍 Verifying via Twilio Verify...');
        const result = await verifyOTPViaTwilioVerify(mobileNo, otp);
        
        if (result.success) {
          // Mark as verified in database
          await db.execute(
            "UPDATE otp_verifications SET verified = 1, verified_at = NOW() WHERE id = ?",
            [record.id]
          );
          
          console.log(`✅ OTP verified successfully via Twilio for ${mobileNo}`);
          
          return res.json({
            success: true,
            verified: true,
            message: "Mobile number verified successfully",
            method: 'twilio_verify'
          });
        } else {
          console.log('❌ Twilio verification failed');
          
          // Increment attempts
          await db.execute(
            "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?",
            [record.id]
          );
          
          return res.status(400).json({
            success: false,
            error: "Invalid OTP. Please check and try again."
          });
        }
      } catch (twilioError) {
        console.error('❌ Twilio verify error:', twilioError.message);
        return res.status(400).json({
          success: false,
          error: twilioError.message || "OTP verification failed"
        });
      }
    }

    // Database verification method
    console.log('📝 Using database verification');

    // Check if OTP has expired
    if (new Date() > new Date(record.expires_at)) {
      console.log('⏰ OTP expired');
      await db.execute(
        "DELETE FROM otp_verifications WHERE mobile_no = ?",
        [mobileNo]
      );
      
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new OTP."
      });
    }

    // Check max attempts
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      console.log('🚫 Max attempts exceeded');
      await db.execute(
        "DELETE FROM otp_verifications WHERE mobile_no = ?",
        [mobileNo]
      );
      
      return res.status(400).json({
        success: false,
        error: "Maximum verification attempts exceeded. Please request a new OTP."
      });
    }

    // Verify OTP
    if (record.otp !== otp) {
      console.log('❌ Invalid OTP');
      await db.execute(
        "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?",
        [record.id]
      );
      
      const remainingAttempts = OTP_MAX_ATTEMPTS - (record.attempts + 1);
      
      return res.status(400).json({
        success: false,
        error: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
      });
    }

    // OTP is valid - mark as verified
    await db.execute(
      "UPDATE otp_verifications SET verified = 1, verified_at = NOW() WHERE id = ?",
      [record.id]
    );

    console.log(`✅ OTP verified successfully for ${mobileNo}`);

    return res.json({
      success: true,
      verified: true,
      message: "Mobile number verified successfully",
      method: 'database'
    });

  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      error: "OTP verification failed",
      details: error.message
    });
  }
});

// Check OTP status endpoint
app.post("/api/check-otp-status", async (req, res) => {
  console.log('📊 POST /api/check-otp-status - Request received');
  
  try {
    const { mobileNo } = req.body;

    if (!mobileNo) {
      return res.status(400).json({
        success: false,
        error: "Mobile number required"
      });
    }

    const [records] = await db.execute(
      `SELECT verified, verified_at FROM otp_verifications 
       WHERE mobile_no = ? AND verified = 1
       ORDER BY verified_at DESC LIMIT 1`,
      [mobileNo]
    );

    if (records.length > 0) {
      return res.json({
        success: true,
        verified: true,
        verifiedAt: records[0].verified_at
      });
    }

    return res.json({
      success: true,
      verified: false
    });

  } catch (error) {
    console.error("❌ Check OTP status error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to check OTP status"
    });
  }
});

console.log('✅ OTP endpoints registered successfully');


// ==================== BRANDS & DROPDOWN ENDPOINTS ====================
app.get("/api/brands", async (req, res) => {
  try {
    console.log("🔍 [BRANDS API] Starting brands fetch...");
    
    const [brands] = await db.execute(`
      SELECT DISTINCT brand 
      FROM offers 
      WHERE brand IS NOT NULL AND brand != ''
      ORDER BY brand ASC
    `);
    
    console.log(`✅ [BRANDS API] Found ${brands.length} brands:`, brands.map(b => b.brand));
    
    res.json({
      success: true,
      brands: brands.map(b => b.brand),
      count: brands.length
    });
  } catch (error) {
    console.error("❌ [BRANDS API] Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch brands",
      details: error.message
    });
  }
});

app.get("/api/assets/:brand", async (req, res) => {
  try {
    const { brand } = req.params;
    console.log("🔍 [ASSETS API] Fetching assets for brand:", brand);
    
    const [assets] = await db.execute(`
      SELECT DISTINCT asset 
      FROM offers 
      WHERE brand = ? AND asset IS NOT NULL AND asset != ''
      ORDER BY asset ASC
    `, [brand]);
    
    res.json({
      success: true,
      brand: brand,
      assets: assets.map(a => a.asset)
    });
  } catch (error) {
    console.error("❌ Error fetching assets:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch assets"
    });
  }
});

app.get("/api/models/:brand/:asset", async (req, res) => {
  try {
    const { brand, asset } = req.params;
    console.log("🔍 [MODELS API] Fetching models for:", brand, asset);
    
    const [models] = await db.execute(`
      SELECT DISTINCT model 
      FROM offers 
      WHERE brand = ? AND asset = ? AND model IS NOT NULL AND model != ''
      ORDER BY model ASC
    `, [brand, asset]);
    
    res.json({
      success: true,
      brand: brand,
      asset: asset,
      models: models.map(m => m.model)
    });
  } catch (error) {
    console.error("❌ Error fetching models:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch models"
    });
  }
});

// ==================== AUTHENTICATION ENDPOINTS ====================
app.post("/api/login", async (req, res) => {
  try {
    const { dealerName, dealerCode, password } = req.body;

    console.log("🔐 Login attempt for dealer:", { dealerName, dealerCode });

    if (!dealerName || !dealerCode || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        error: "Dealer name, dealer code, and password are all required"
      });
    }

    const inputDealerName = dealerName.trim().toUpperCase();
    const inputDealerCode = dealerCode.trim().toUpperCase();

    const [usersByCode] = await db.execute(
      "SELECT * FROM users WHERE UPPER(dealer_code) = ?",
      [inputDealerCode]
    );

    if (usersByCode.length === 0) {
      console.log("❌ Dealer code not found:", inputDealerCode);
      return res.status(401).json({
        success: false,
        error: "Dealer code not found. Please check your dealer code."
      });
    }

    const user = usersByCode[0];
    const dbDealerName = user.dealer_name.trim().toUpperCase();
    const dbDealerCode = user.dealer_code.trim().toUpperCase();

    console.log("📊 Found user:", { 
      dbName: dbDealerName, 
      inputName: inputDealerName,
      dbCode: dbDealerCode,
      inputCode: inputDealerCode
    });

    if (dbDealerName !== inputDealerName) {
      console.log("❌ Dealer name mismatch");
      return res.status(401).json({
        success: false,
        error: `Dealer name '${dealerName}' does not match the registered name for dealer code '${dealerCode}'. Expected name: '${user.dealer_name}'.`
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log("❌ Password incorrect");
      return res.status(401).json({
        success: false,
        error: "Password is incorrect. Please check your password."
      });
    }

    const token = signJwt({ id: user.id, dealerCode: user.dealer_code });

    const responseData = {
      success: true,
      message: "Login successful! All credentials verified.",
      token,
      user: {
        id: user.id,
        dealerCode: user.dealer_code,
        dealerName: user.dealer_name,
        email: user.email,
        mobileNumber: user.mobile_number,
        ownerName: user.owner_name,
        enterpriseType: user.enterprise_type,
        createdAt: user.created_at
      }
    };

    console.log("📤 Sending response:", JSON.stringify(responseData, null, 2));
    return res.status(200).json(responseData);

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Login failed. Please try again.",
      details: error.message
    });
  }
});

app.get("/api/auth/validate", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: "Missing token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.log("❌ Token verification failed:", err.message);
      return res.status(401).json({ success: false, error: "Invalid or expired token" });
    }

    const [rows] = await db.execute(
      "SELECT id, dealer_code, dealer_name, email, mobile_number, owner_name, enterprise_type, created_at FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    const user = rows[0];

    return res.json({
      success: true,
      user: {
        id: user.id,
        dealerCode: user.dealer_code,
        dealerName: user.dealer_name,
        email: user.email,
        mobileNumber: user.mobile_number,
        ownerName: user.owner_name,
        enterpriseType: user.enterprise_type,
        createdAt: user.created_at
      }
    });

  } catch (err) {
    console.error("❌ /api/auth/validate error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==================== UPLOADS (multer) ====================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ==================== SIGNUP ====================
app.post("/api/signup", upload.fields([
  { name: 'cancelCheque', maxCount: 1 },
  { name: 'shopPhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("📨 Received signup request");

    const {
      dealerName,
      mobileNumber,
      email,
      ownerName,
      ownerMobile,
      gstNumber,
      enterpriseType,
      password,
      confirmPassword
    } = req.body;

    if (!dealerName || !mobileNumber || !email || !ownerName || !ownerMobile || 
        !gstNumber || !enterpriseType || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match"
      });
    }

    const [existingUser] = await db.execute(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Email already registered"
      });
    }

    const [existingMobile] = await db.execute(
      "SELECT mobile_number FROM users WHERE mobile_number = ?",
      [mobileNumber]
    );

    if (existingMobile.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Mobile number already registered"
      });
    }

    const dealerCode = await generateDealerCode();
    console.log("🎯 Generated dealer code for new user:", dealerCode);
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const cancelChequePhoto = req.files?.cancelCheque ? req.files.cancelCheque[0].filename : null;
    const shopPhoto = req.files?.shopPhoto ? req.files.shopPhoto[0].filename : null;

    const insertQuery = `
      INSERT INTO users (
        dealer_code,
        dealer_name, 
        mobile_number, 
        email, 
        owner_name, 
        owner_mobile, 
        gst_number, 
        cancel_cheque_photo, 
        shop_photo, 
        enterprise_type, 
        password,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    console.log("🚀 Executing INSERT query with dealer_code:", dealerCode);

    const [result] = await db.execute(insertQuery, [
      dealerCode,
      dealerName,
      mobileNumber,
      email,
      ownerName,
      ownerMobile,
      gstNumber,
      cancelChequePhoto,
      shopPhoto,
      enterpriseType,
      hashedPassword
    ]);

    console.log("✅ User registered successfully - ID:", result.insertId, "Dealer Code:", dealerCode);

    res.json({
      success: true,
      message: "Registration successful!",
      userId: result.insertId,
      dealerCode: dealerCode,
      data: {
        dealerCode: dealerCode,
        dealerName,
        email,
        mobileNumber,
        ownerName,
        enterpriseType
      }
    });

  } catch (error) {
    console.error("❌ Signup error details:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('dealer_code')) {
        return res.status(400).json({
          success: false,
          error: "Dealer code conflict. Please try again."
        });
      }
      return res.status(400).json({
        success: false,
        error: "Email or mobile number already exists"
      });
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: "File size too large. Maximum size is 5MB."
        });
      }
      return res.status(400).json({
        success: false,
        error: `File upload error: ${error.message}`
      });
    }

    res.status(500).json({
      success: false,
      error: "Registration failed. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== DISCOUNT CHECKING ENDPOINT ====================
app.post("/api/check-discount", async (req, res) => {
  const { brand, asset, model, mobileNo, amount } = req.body;
  
  console.log('🔍 Discount check:', { brand, asset, model, mobileNo, amount });
  
  if (!brand || !asset || !model || !mobileNo || !amount) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const bankSql = `
      SELECT id, bankName, cardType, cardLimit, mobileNo
      FROM baningcredentials 
      WHERE mobileNo = ? OR mobileNo = ? OR mobileNo = ?
      ORDER BY bankName, cardType
    `;
    
    const mobileVariations = [
      mobileNo,
      mobileNo.startsWith('0') ? mobileNo.substring(1) : '0' + mobileNo,
      mobileNo.replace(/\D/g, '')
    ];
    
    const [bankResults] = await db.execute(bankSql, mobileVariations);
    
    console.log("📊 Customer bank cards (with exact limits):");
    bankResults.forEach((bank, i) => {
      console.log(`  ${i+1}. ${bank.bankName} ${bank.cardType} - Exact Limit: ₹${parseFloat(bank.cardLimit || 0).toLocaleString()}`);
    });

    const basePrice = parseFloat(amount);

    if (bankResults.length === 0) {
      return res.json({
        success: false,
        message: "Customer not registered. Please register your bank details.",
        basePrice, finalPrice: basePrice, discount: 0,
        offerDetails: null, allOffers: [], customerBanks: [],
        noOffersReason: "not_registered", showPaymentButton: true
      });
    }

    const bankLimitsMap = {};
    bankResults.forEach(card => {
      if (!bankLimitsMap[card.bankName]) {
        bankLimitsMap[card.bankName] = [];
      }
      bankLimitsMap[card.bankName].push({
        id: card.id,
        cardType: card.cardType,
        cardLimit: parseFloat(card.cardLimit || 0),
        mobileNo: card.mobileNo
      });
    });

    console.log("💳 Bank Limits Map:", JSON.stringify(bankLimitsMap, null, 2));

    let hasCreditCard = bankResults.some(b => b.cardType && b.cardType.toLowerCase().trim() === 'credit');
    const customerBankNames = [...new Set(bankResults.map(b => b.bankName))];
    
    let allAvailableOffers = [];
    
    if (hasCreditCard) {
      // Get personalized offers
      const personalizedSql = `
        SELECT discountAvailable, discountName, discountPercent, discountAmount, bankName, mobileNo
        FROM offers 
        WHERE bankName IN (${customerBankNames.map(() => '?').join(',')}) 
          AND brand = ? AND asset = ? AND model = ? 
          AND (mobileNo = ? OR mobileNo = ? OR mobileNo = ?) AND discountAvailable = 'yes'
        ORDER BY CASE WHEN discountPercent IS NOT NULL THEN (? * discountPercent / 100) ELSE discountAmount END DESC
      `;
      
      const [personalizedOffers] = await db.execute(personalizedSql, 
        [...customerBankNames, brand, asset, model, ...mobileVariations, basePrice]);

      // Get generic offers
      const genericSql = `
        SELECT discountAvailable, discountName, discountPercent, discountAmount, bankName, mobileNo
        FROM offers 
        WHERE bankName IN (${customerBankNames.map(() => '?').join(',')}) 
          AND brand = ? AND asset = ? AND model = ? 
          AND mobileNo IS NULL AND discountAvailable = 'yes'
        ORDER BY CASE WHEN discountPercent IS NOT NULL THEN (? * discountPercent / 100) ELSE discountAmount END DESC
      `;
      
      const [genericOffers] = await db.execute(genericSql, 
        [...customerBankNames, brand, asset, model, basePrice]);

      console.log(`📊 Personalized: ${personalizedOffers.length}, Generic: ${genericOffers.length}`);

      // Process all offers and attach card limits
      const processOffer = (offer, isPersonalized) => {
        const discount = offer.discountPercent 
          ? (basePrice * offer.discountPercent / 100)
          : parseFloat(offer.discountAmount || 0);
        
        const bankCards = bankLimitsMap[offer.bankName] || [];
        const creditCard = bankCards.find(c => c.cardType.toLowerCase() === 'credit');
        const cardLimit = creditCard ? creditCard.cardLimit : 0;
        
        console.log(`💰 ${offer.bankName}: cardLimit = ${cardLimit}`);
        
        return {
          bank: offer.bankName,
          bankName: offer.bankName,
          discountName: offer.discountName,
          discount: discount,
          finalPrice: basePrice - discount,
          discountType: offer.discountPercent ? 'percentage' : 'fixed',
          discountValue: offer.discountPercent || offer.discountAmount,
          isPersonalized: isPersonalized,
          cardLimit: cardLimit,
          exactCardLimit: cardLimit,
          cardType: creditCard ? creditCard.cardType : 'N/A',
          exactCardInfo: creditCard ? {
            id: creditCard.id,
            cardLimit: cardLimit,
            parsedCardLimit: cardLimit,
            cardType: creditCard.cardType,
            mobileNo: creditCard.mobileNo,
            bankName: offer.bankName
          } : null
        };
      };

      personalizedOffers.forEach(offer => {
        allAvailableOffers.push(processOffer(offer, true));
      });

      genericOffers.forEach(offer => {
        if (!personalizedOffers.some(p => p.bankName === offer.bankName)) {
          allAvailableOffers.push(processOffer(offer, false));
        }
      });

      allAvailableOffers.sort((a, b) => b.discount - a.discount);
      
      console.log(`📋 Total offers: ${allAvailableOffers.length}`);
      allAvailableOffers.forEach((offer, i) => {
        console.log(`  ${i+1}. ${offer.bank}: discount=₹${offer.discount}, cardLimit=₹${offer.cardLimit}`);
      });
    }

    const customerBanks = bankResults.map(b => ({
      id: b.id,
      name: `${b.bankName} (${b.cardType})`,
      bankName: b.bankName,
      cardType: b.cardType,
      cardLimit: parseFloat(b.cardLimit || 0),
      exactLimit: parseFloat(b.cardLimit || 0),
      exactCardInfo: {
        id: b.id,
        cardLimit: parseFloat(b.cardLimit || 0),
        parsedCardLimit: parseFloat(b.cardLimit || 0),
        cardType: b.cardType,
        mobileNo: b.mobileNo,
        bankName: b.bankName
      }
    }));

    console.log("✅ customerBanks with limits:", JSON.stringify(customerBanks, null, 2));

    if (hasCreditCard && allAvailableOffers.length > 0) {
      const bestOffer = allAvailableOffers[0];
      
      const allOffersResponse = allAvailableOffers.map(offer => ({
        ...offer,
        isBestOffer: offer === bestOffer
      }));
      
      console.log("📤 Sending response with card limits");
      console.log("📤 First offer:", JSON.stringify(allOffersResponse[0], null, 2));
      
      return res.json({
        success: true,
        message: `${bestOffer.discountName}${bestOffer.isPersonalized ? ' (Personalized)' : ''}`,
        basePrice,
        discount: bestOffer.discount,
        finalPrice: bestOffer.finalPrice,
        offerDetails: {
          bank: bestOffer.bank,
          bankName: bestOffer.bankName,
          discountType: bestOffer.discountType,
          discountValue: bestOffer.discountValue,
          isPersonalized: bestOffer.isPersonalized,
          offerName: bestOffer.discountName,
          cardLimit: bestOffer.cardLimit,
          exactCardLimit: bestOffer.cardLimit,
          cardType: bestOffer.cardType,
          exactCardInfo: bestOffer.exactCardInfo
        },
        allOffers: allOffersResponse,
        customerBanks: customerBanks,
        showPaymentButton: true,
        mobileNo: mobileNo,
        brand: brand,
        model: model
      });
    }
    
    if (!hasCreditCard) {
      return res.json({
        success: false,
        message: "You have only Debit Cards. Credit Cards required for discounts.",
        basePrice, finalPrice: basePrice, discount: 0,
        offerDetails: null,
        allOffers: [],
        customerBanks: customerBanks,
        noOffersReason: "no_credit_card",
        showPaymentButton: true,
        mobileNo: mobileNo,
        brand: brand,
        model: model
      });
    }
    
    return res.json({
      success: false,
      message: "No offers available for your registered banks.",
      basePrice, finalPrice: basePrice, discount: 0,
      offerDetails: null,
      allOffers: [],
      customerBanks: customerBanks,
      noOffersReason: "no_offers_for_banks",
      showPaymentButton: true,
      mobileNo: mobileNo,
      brand: brand,
      model: model
    });

  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
});

// ==================== OTHER ENDPOINTS ====================
app.get("/api/users", async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT 
        id,
        dealer_code,
        dealer_name,
        mobile_number,
        email,
        owner_name,
        owner_mobile,
        gst_number,
        cancel_cheque_photo,
        shop_photo,
        enterprise_type,
        created_at
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users"
    });
  }
});

app.post("/api/fix-dealer-codes", async (req, res) => {
  try {
    console.log("🔧 Fixing NULL dealer codes...");
    
    const [nullCodeUsers] = await db.execute(
      "SELECT id, dealer_name FROM users WHERE dealer_code IS NULL ORDER BY id"
    );
    
    console.log(`📝 Found ${nullCodeUsers.length} users with NULL dealer codes`);
    
    let fixedCount = 0;
    let currentCode = "D001";
    
    const [maxCodeResult] = await db.execute(
      "SELECT dealer_code FROM users WHERE dealer_code IS NOT NULL ORDER BY dealer_code DESC LIMIT 1"
    );
    
    if (maxCodeResult.length > 0) {
      const maxCode = maxCodeResult[0].dealer_code;
      if (maxCode.startsWith('D')) {
        const numericPart = parseInt(maxCode.substring(1));
        if (!isNaN(numericPart)) {
          currentCode = 'D' + (numericPart + 1).toString().padStart(3, '0');
        }
      }
    }
    
    for (const user of nullCodeUsers) {
      await db.execute(
        "UPDATE users SET dealer_code = ? WHERE id = ?",
        [currentCode, user.id]
      );
      
      console.log(`✅ Fixed user ${user.id} (${user.dealer_name}) with dealer code: ${currentCode}`);
      fixedCount++;
      
      const numericPart = parseInt(currentCode.substring(1));
      currentCode = 'D' + (numericPart + 1).toString().padStart(3, '0');
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} users with NULL dealer codes`,
      fixedCount: fixedCount
    });
    
  } catch (error) {
    console.error("❌ Error fixing dealer codes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fix dealer codes"
    });
  }
});

app.delete("/api/users", async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM users");
    res.json({
      success: true,
      message: `Deleted ${result.affectedRows} users successfully`,
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error("❌ Error deleting users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete users"
    });
  }
});

// ==================== UTILITY FUNCTIONS ====================
async function generateDealerCode() {
  try {
    const [results] = await db.execute(
      "SELECT dealer_code FROM users WHERE dealer_code IS NOT NULL ORDER BY id DESC LIMIT 1"
    );

    let newCode = "D001";

    if (results.length > 0 && results[0].dealer_code) {
      const latestCode = results[0].dealer_code;
      console.log("📊 Latest dealer code found:", latestCode);
      
      if (latestCode.startsWith('D')) {
        const numericPart = parseInt(latestCode.substring(1));
        if (!isNaN(numericPart)) {
          const newNumber = numericPart + 1;
          newCode = 'D' + newNumber.toString().padStart(3, '0');
          console.log("🔢 Incremented dealer code:", newCode);
        }
      }
    } else {
      console.log("📝 No existing dealer codes, starting from D001");
    }

    return newCode;
  } catch (error) {
    console.error("❌ Error generating dealer code:", error);
    const timestampCode = 'D' + Date.now().toString().slice(-3);
    console.log("🕒 Fallback dealer code:", timestampCode);
    return timestampCode;
  }
}

// ==================== SERVER STARTUP ====================
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Ready for connections`);
  console.log(`💾 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
  console.log(`📁 File uploads: /uploads directory`);
  console.log('='.repeat(60));
  console.log('📍 Available Endpoints:');
  console.log(`   ✓ GET  /api/health`);
  console.log(`   ✓ GET  /api/test-db`);
  console.log(`   ✓ POST /api/send-otp`);
  console.log(`   ✓ POST /api/verify-otp`);
  console.log(`   ✓ POST /api/check-otp-status`);
  console.log(`   ✓ POST /api/login`);
  console.log(`   ✓ POST /api/signup`);
  console.log(`   ✓ POST /api/check-discount`);
  console.log(`   ✓ GET  /api/brands`);
  console.log(`   ✓ GET  /api/assets/:brand`);
  console.log(`   ✓ GET  /api/models/:brand/:asset`);
  console.log('='.repeat(60));
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log('='.repeat(60));
});