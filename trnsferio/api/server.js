// server.js - Full file with JWT stateless auth integrated
require('dotenv').config();
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
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m'; // example: '15m'

// ==================== MIDDLEWARE SETUP ====================
// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '200kb' }));

// Ensure uploads directory exists and serve it
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}
app.use('/uploads', express.static('uploads'));

// Add request logging middleware
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

// Middleware: verify token + re-check DB user (stateless)
async function authenticateMiddleware(req, res, next) {
  try {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Missing token' });

    const payload = verifyJwt(token);
    if (!payload || !payload.id) return res.status(401).json({ success: false, error: 'Invalid token' });

    // Re-check DB for user existence & active status
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

// ==================== ROUTES SETUP ====================

// Root endpoint
app.get("/", (req, res) => {
  res.send("✅ Server is running. Use /api/health, /api/signup, or /api/check-discount.");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Test database endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const [tables] = await db.execute("SHOW TABLES LIKE 'users'");
    const [columns] = await db.execute("DESCRIBE users");
    
    // Test dealer code generation
    const testCode = await generateDealerCode();
    
    res.json({
      success: true,
      message: "Database connection successful",
      tableExists: tables.length > 0,
      nextDealerCode: testCode,
      columns: columns.map(col => ({
        field: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Database connection failed",
      details: error.message
    });
  }
});

// ==================== BRANDS & DROPDOWN ENDPOINTS ====================

// Get all unique brands
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

// Get assets for a specific brand
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

// Get models for a specific brand and asset
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

// Login endpoint for dealers - returns JWT + user info
app.post("/api/login", async (req, res) => {
  try {
    const { dealerName, dealerCode, password } = req.body;

    console.log("🔐 Login attempt for dealer:", { dealerName, dealerCode });

    // Validation
    if (!dealerName || !dealerCode || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        error: "Dealer name, dealer code, and password are all required"
      });
    }

    const inputDealerName = dealerName.trim().toUpperCase();
    const inputDealerCode = dealerCode.trim().toUpperCase();

    // Step 1: Find user by dealer code first
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

    // Step 2: Check if dealer name matches the dealer code
    if (dbDealerName !== inputDealerName) {
      console.log("❌ Dealer name mismatch");
      return res.status(401).json({
        success: false,
        error: `Dealer name '${dealerName}' does not match the registered name for dealer code '${dealerCode}'. Expected name: '${user.dealer_name}'.`
      });
    }

    // Step 3: Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log("❌ Password incorrect");
      return res.status(401).json({
        success: false,
        error: "Password is incorrect. Please check your password."
      });
    }

    // Step 4: All validations passed - sign JWT
    const token = signJwt({ id: user.id, dealerCode: user.dealer_code });

    // Prepare safe response
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

// Token validation endpoint - verifies JWT + re-check DB
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

    // Re-check user exists and fetch fresh data
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
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

    // Validation
    if (!dealerName || !mobileNumber || !email || !ownerName || !ownerMobile || 
        !gstNumber || !enterpriseType || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match"
      });
    }

    // Check if email already exists
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

    // Check if mobile number already exists
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

    // Generate unique dealer code
    const dealerCode = await generateDealerCode();
    console.log("🎯 Generated dealer code for new user:", dealerCode);
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Handle file uploads
    const cancelChequePhoto = req.files?.cancelCheque ? req.files.cancelCheque[0].filename : null;
    const shopPhoto = req.files?.shopPhoto ? req.files.shopPhoto[0].filename : null;

    // Insert into database WITH dealer_code
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
      dealerCode,        // dealer_code
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
    
    // Handle specific database errors
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

    // Handle file upload errors
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
  
  console.log('Received discount check request:', { brand, asset, model, mobileNo, amount });
  
  if (!brand || !asset || !model || !mobileNo || !amount) {
    return res.status(400).json({ 
      error: "brand, asset, model, mobileNo, and amount are required" 
    });
  }

  try {
    // Step 1: Get customer's bank information WITH cardLimit - FIXED: Handle mobile number with/without leading 0
    const bankSql = `
      SELECT DISTINCT bankName, cardType, cardLimit 
      FROM baningcredentials 
      WHERE mobileNo = ? OR mobileNo = ? OR mobileNo = ?
    `;
    
    // Try multiple formats of the mobile number
    const mobileVariations = [
      mobileNo, // original
      mobileNo.startsWith('0') ? mobileNo.substring(1) : '0' + mobileNo, // add/remove leading 0
      mobileNo.replace(/\D/g, '') // numbers only
    ];
    
    const [bankResults] = await db.execute(bankSql, mobileVariations);
    console.log("Customer banks with limits:", bankResults);

    const basePrice = parseFloat(amount);

    // Step 1.1: Check if customer exists
    if (bankResults.length === 0) {
      console.log("Customer not found in baningcredentials table");
      return res.json({
        success: false,
        message: "Customer not found. Please register your bank details first to check for discount offers.",
        basePrice: basePrice,
        finalPrice: basePrice,
        discount: 0,
        offerDetails: null,
        allOffers: [],
        customerBanks: [],
        noOffersReason: "not_registered",
        showPaymentButton: true
      });
    }

    // Step 1.2: Check if customer has credit cards
    let hasCreditCard = false;
    for (let bank of bankResults) {
      if (bank.cardType && bank.cardType.toString().toLowerCase().trim() === 'credit') {
        hasCreditCard = true;
        break;
      }
    }
    
    console.log("Customer has credit card:", hasCreditCard);

    // Step 2: Get customer's bank names
    const customerBankNames = bankResults.map(bank => bank.bankName);
    
    // Step 3: Get ALL available offers for this product from customer's banks (only if they have credit cards)
    let allAvailableOffers = [];
    
    if (hasCreditCard) {
      // First get personalized offers
      const personalizedSql = `
        SELECT discountAvailable, discountName, discountPercent, discountAmount, bankName, mobileNo
        FROM offers 
        WHERE bankName IN (${customerBankNames.map(() => '?').join(',')}) 
          AND brand = ? AND asset = ? AND model = ? 
          AND (mobileNo = ? OR mobileNo = ? OR mobileNo = ?) AND discountAvailable = 'yes'
        ORDER BY 
          CASE WHEN discountPercent IS NOT NULL 
            THEN (? * discountPercent / 100) 
            ELSE discountAmount 
          END DESC
      `;
      
      const [personalizedOffers] = await db.execute(personalizedSql, 
        [...customerBankNames, brand, asset, model, ...mobileVariations, basePrice]);

      // Then get generic offers
      const genericSql = `
        SELECT discountAvailable, discountName, discountPercent, discountAmount, bankName, mobileNo
        FROM offers 
        WHERE bankName IN (${customerBankNames.map(() => '?').join(',')}) 
          AND brand = ? AND asset = ? AND model = ? 
          AND mobileNo IS NULL AND discountAvailable = 'yes'
        ORDER BY 
          CASE WHEN discountPercent IS NOT NULL 
            THEN (? * discountPercent / 100) 
            ELSE discountAmount 
          END DESC
      `;
      
      const [genericOffers] = await db.execute(genericSql, 
        [...customerBankNames, brand, asset, model, basePrice]);

      // Create a map of bank to cardLimit from customer's registered banks
      const bankCardLimitMap = {};
      bankResults.forEach(bank => {
        if (bank.cardLimit) {
          bankCardLimitMap[bank.bankName] = bank.cardLimit;
        }
      });

      // Combine and process all offers
      // Add personalized offers first (higher priority)
      personalizedOffers.forEach(offer => {
        const discount = offer.discountPercent 
          ? (basePrice * offer.discountPercent / 100)
          : (offer.discountAmount || 0);
        
        // Get card limit for this bank from the map
        const cardLimit = bankCardLimitMap[offer.bankName] || null;
        
        allAvailableOffers.push({
          ...offer,
          calculatedDiscount: discount,
          isPersonalized: true,
          finalPrice: basePrice - discount,
          cardLimit: cardLimit
        });
      });

      // Add generic offers (only if no personalized offer from same bank exists)
      genericOffers.forEach(offer => {
        const hasPersonalizedFromSameBank = personalizedOffers.some(p => p.bankName === offer.bankName);
        
        if (!hasPersonalizedFromSameBank) {
          const discount = offer.discountPercent 
            ? (basePrice * offer.discountPercent / 100)
            : (offer.discountAmount || 0);
          
          // Get card limit for this bank from the map
          const cardLimit = bankCardLimitMap[offer.bankName] || null;
          
          allAvailableOffers.push({
            ...offer,
            calculatedDiscount: discount,
            isPersonalized: false,
            finalPrice: basePrice - discount,
            cardLimit: cardLimit
          });
        }
      });

      // Sort by highest discount
      allAvailableOffers.sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);
    }

    // Step 4: Handle different scenarios
    
    // Scenario 1: Customer has credit cards and offers are available
    if (hasCreditCard && allAvailableOffers.length > 0) {
      const bestOffer = allAvailableOffers[0];
      const maxDiscount = bestOffer.calculatedDiscount;
      const finalPrice = basePrice - maxDiscount;

      let displayMessage = bestOffer.discountName;
      if (bestOffer.isPersonalized) {
        displayMessage += ' (Personalized Offer)';
      }
      
      if (allAvailableOffers.length > 1) {
        displayMessage += `\n\n${allAvailableOffers.length} offers available for this product!`;
        displayMessage += `\nBest offer: ${bestOffer.bankName} Bank`;
      }
      
      displayMessage += `\n\nPricing Details:`;
      displayMessage += `\nBase Price: ₹${basePrice.toLocaleString()}`;
      displayMessage += `\nBest Discount: -₹${maxDiscount.toLocaleString()} (${bestOffer.bankName})`;
      displayMessage += `\nFinal Price: ₹${finalPrice.toLocaleString()}`;
      displayMessage += `\nYou save: ₹${maxDiscount.toLocaleString()}!`;
      
      return res.json({
        success: true,
        message: displayMessage,
        basePrice: basePrice,
        discount: maxDiscount,
        finalPrice: finalPrice,
        offerDetails: {
          bank: bestOffer.bankName,
          discountType: bestOffer.discountPercent ? 'percentage' : 'fixed',
          discountValue: bestOffer.discountPercent || bestOffer.discountAmount,
          isPersonalized: bestOffer.isPersonalized,
          offerName: bestOffer.discountName,
          cardLimit: bestOffer.cardLimit
        },
        allOffers: allAvailableOffers.map(offer => ({
          bank: offer.bankName,
          discountName: offer.discountName,
          discount: offer.calculatedDiscount,
          finalPrice: offer.finalPrice,
          discountType: offer.discountPercent ? 'percentage' : 'fixed',
          discountValue: offer.discountPercent || offer.discountAmount,
          isPersonalized: offer.isPersonalized,
          isBestOffer: offer === bestOffer,
          cardLimit: offer.cardLimit
        })),
        customerBanks: bankResults.map(b => ({
          name: `${b.bankName} (${b.cardType})`,
          cardLimit: b.cardLimit
        })),
        showPaymentButton: true
      });
    }
    
    // Scenario 2: Customer has only debit cards - show all available offers but indicate credit card needed
    if (!hasCreditCard) {
      // Create a map of bank to cardLimit from customer's registered banks
      const bankCardLimitMap = {};
      bankResults.forEach(bank => {
        if (bank.cardLimit) {
          bankCardLimitMap[bank.bankName] = bank.cardLimit;
        }
      });
      
      // Get all available offers for this product (from any bank)
      const allOffersSql = `
        SELECT discountAvailable, discountName, discountPercent, discountAmount, bankName, mobileNo
        FROM offers 
        WHERE brand = ? AND asset = ? AND model = ? AND discountAvailable = 'yes'
        ORDER BY 
          CASE WHEN discountPercent IS NOT NULL 
            THEN (? * discountPercent / 100) 
            ELSE discountAmount 
          END DESC
      `;
      
      const [allOffers] = await db.execute(allOffersSql, [brand, asset, model, basePrice]);
      
      if (allOffers.length > 0) {
        // Process all offers to show what's available
        const processedOffers = allOffers.map(offer => {
          const discount = offer.discountPercent 
            ? (basePrice * offer.discountPercent / 100)
            : (offer.discountAmount || 0);
          
          // Get card limit for this bank from the map if customer has this bank
          const cardLimit = bankCardLimitMap[offer.bankName] || null;
          
          return {
            ...offer,
            calculatedDiscount: discount,
            isPersonalized: offer.mobileNo === mobileNo,
            finalPrice: basePrice - discount,
            requiresCreditCard: true,
            cardLimit: cardLimit
          };
        });
        
        processedOffers.sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);
        const bestOffer = processedOffers[0];
        
        let displayMessage = `You have only Debit Cards registered. Below offers are available but require Credit Cards:\n\n`;
        displayMessage += `Best Available Offer: ${bestOffer.discountName} (${bestOffer.bankName})\n`;
        displayMessage += `Potential Savings: ₹${bestOffer.calculatedDiscount.toLocaleString()}\n\n`;
        displayMessage += `Your Registered Cards:\n`;
        bankResults.forEach(bank => {
          displayMessage += `• ${bank.bankName} (${bank.cardType})`;
          if (bank.cardLimit) {
            displayMessage += ` [Limit: ₹${parseFloat(bank.cardLimit).toLocaleString()}]`;
          }
          displayMessage += `\n`;
        });
        displayMessage += `\nTo avail discounts, you need to:\n`;
        displayMessage += `• Apply for Credit Cards from the above banks\n`;
        displayMessage += `• Contact your bank for Credit Card options\n\n`;
        displayMessage += `Current Pricing:\n`;
        displayMessage += `Base Price: ₹${basePrice.toLocaleString()}\n`;
        displayMessage += `Final Price: ₹${basePrice.toLocaleString()} (No discount applied)`;
        
        return res.json({
          success: false,
          message: displayMessage,
          basePrice: basePrice,
          discount: 0,
          finalPrice: basePrice,
          offerDetails: null,
          allOffers: processedOffers.map(offer => ({
            bank: offer.bankName,
            discountName: offer.discountName,
            discount: offer.calculatedDiscount,
            finalPrice: offer.finalPrice,
            discountType: offer.discountPercent ? 'percentage' : 'fixed',
            discountValue: offer.discountPercent || offer.discountAmount,
            isPersonalized: offer.isPersonalized,
            requiresCreditCard: true,
            isBestOffer: offer === bestOffer,
            cardLimit: offer.cardLimit
          })),
          customerBanks: bankResults.map(b => ({
            name: `${b.bankName} (${b.cardType})`,
            cardLimit: b.cardLimit
          })),
          noOffersReason: "no_credit_card",
          showPaymentButton: true,
          showCreditCardOffers: true
        });
      }
    }
    
    // Scenario 3: Customer has credit cards but no offers available for their banks
    if (hasCreditCard && allAvailableOffers.length === 0) {
      let displayMessage = `No offers available for your registered bank cards.\n\n`;
      displayMessage += `Your Registered Cards:\n`;
      bankResults.forEach(bank => {
        displayMessage += `• ${bank.bankName} (${bank.cardType})`;
        if (bank.cardLimit) {
          displayMessage += ` [Limit: ₹${parseFloat(bank.cardLimit).toLocaleString()}]`;
        }
        displayMessage += `\n`;
      });
      
      // Check if there are offers available with other banks
      const otherOffersSql = `
        SELECT DISTINCT bankName, discountName, discountAvailable
        FROM offers 
        WHERE brand = ? AND asset = ? AND model = ? AND discountAvailable = 'yes'
      `;
      
      const [otherOffers] = await db.execute(otherOffersSql, [brand, asset, model]);
      const offersWithOtherBanks = otherOffers.filter(offer => !customerBankNames.includes(offer.bankName));
      
      if (offersWithOtherBanks.length > 0) {
        displayMessage += `\nOffers available with other banks:\n`;
        offersWithOtherBanks.forEach(offer => {
          displayMessage += `• ${offer.bankName}: ${offer.discountName}\n`;
        });
        displayMessage += `\nConsider getting cards from these banks for future discounts.`;
      }
      
      displayMessage += `\n\nPricing Details:\n`;
      displayMessage += `Base Price: ₹${basePrice.toLocaleString()}\n`;
      displayMessage += `Final Price: ₹${basePrice.toLocaleString()}\n\n`;
      displayMessage += `Please proceed with payment at regular price.`;
      
      return res.json({
        success: false,
        message: displayMessage,
        basePrice: basePrice,
        discount: 0,
        finalPrice: basePrice,
        offerDetails: null,
        allOffers: [],
        customerBanks: bankResults.map(b => ({
          name: `${b.bankName} (${b.cardType})`,
          cardLimit: b.cardLimit
        })),
        noOffersReason: "no_offers_for_banks",
        showPaymentButton: true
      });
    }

    // Scenario 4: Fallback - no offers found at all
    let displayMessage = "No discount offers available for this product from any bank.\n\n";
    displayMessage += `Pricing Details:\n`;
    displayMessage += `Base Price: ₹${basePrice.toLocaleString()}\n`;
    displayMessage += `Final Price: ₹${basePrice.toLocaleString()}\n\n`;
    displayMessage += `Please proceed with payment at regular price.`;
    
    return res.json({
      success: false,
      message: displayMessage,
      basePrice: basePrice,
      discount: 0,
      finalPrice: basePrice,
      offerDetails: null,
      allOffers: [],
      customerBanks: bankResults.map(b => ({
        name: `${b.bankName} (${b.cardType})`,
        cardLimit: b.cardLimit
      })),
      noOffersReason: "no_offers",
      showPaymentButton: true
    });

  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ 
      error: "Database error", 
      details: err.message,
      success: false
    });
  }
});

// ==================== OTHER ENDPOINTS ====================

// Get all users endpoint (for testing)
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

// Fix dealer codes endpoint (for existing users with NULL dealer_code)
app.post("/api/fix-dealer-codes", async (req, res) => {
  try {
    console.log("🔧 Fixing NULL dealer codes...");
    
    // Get all users with NULL dealer_code
    const [nullCodeUsers] = await db.execute(
      "SELECT id, dealer_name FROM users WHERE dealer_code IS NULL ORDER BY id"
    );
    
    console.log(`📝 Found ${nullCodeUsers.length} users with NULL dealer codes`);
    
    let fixedCount = 0;
    let currentCode = "D001";
    
    // First, get the highest existing dealer code to continue from there
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
    
    // Fix each user with NULL dealer_code
    for (const user of nullCodeUsers) {
      await db.execute(
        "UPDATE users SET dealer_code = ? WHERE id = ?",
        [currentCode, user.id]
      );
      
      console.log(`✅ Fixed user ${user.id} (${user.dealer_name}) with dealer code: ${currentCode}`);
      fixedCount++;
      
      // Increment code for next user
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

// Delete all users endpoint (for testing/reset)
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

// ==================== SERVER STARTUP ====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Ready for connections`);
  console.log(`💾 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
  console.log(`📁 File uploads: /uploads directory`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test DB: http://localhost:${PORT}/api/test-db`);
  console.log(`💰 Discount check: http://localhost:${PORT}/api/check-discount`);
  console.log(`🏷️ Brands API: http://localhost:${PORT}/api/brands`);
  console.log(`📦 Assets API: http://localhost:${PORT}/api/assets/:brand`);
  console.log(`🔧 Models API: http://localhost:${PORT}/api/models/:brand/:asset`);
});

// ==================== UTILITY FUNCTIONS ====================
async function generateDealerCode() {
  try {
    // Get the latest dealer code from the database
    const [results] = await db.execute(
      "SELECT dealer_code FROM users WHERE dealer_code IS NOT NULL ORDER BY id DESC LIMIT 1"
    );

    let newCode = "D001"; // Default starting code

    if (results.length > 0 && results[0].dealer_code) {
      const latestCode = results[0].dealer_code;
      console.log("📊 Latest dealer code found:", latestCode);
      
      if (latestCode.startsWith('D')) {
        // Extract the numeric part and increment
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
    // Fallback: generate code based on timestamp
    const timestampCode = 'D' + Date.now().toString().slice(-3);
    console.log("🕒 Fallback dealer code:", timestampCode);
    return timestampCode;
  }
}