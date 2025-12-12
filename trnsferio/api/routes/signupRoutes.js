/**
 * Signup Routes - New multi-step signup with OTP verification
 * 
 * Flow:
 * 1. POST /api/signup/initiate - Submit form data, send OTP email
 * 2. POST /api/signup/verify-otp - Verify OTP and complete registration
 * 3. POST /api/signup/resend-otp - Resend OTP if expired
 */

const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { sendOTPEmail, sendWelcomeEmail, generateOTP, getOTPExpiry } = require('../services/emailService');

const router = express.Router();

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate unique dealer code
 */
async function generateDealerCode() {
  try {
    // Get the highest existing dealer code
    const [rows] = await db.execute(
      "SELECT dealer_code FROM users WHERE dealer_code LIKE 'D%' ORDER BY CAST(SUBSTRING(dealer_code, 2) AS UNSIGNED) DESC LIMIT 1"
    );
    
    let nextNumber = 1;
    if (rows.length > 0 && rows[0].dealer_code) {
      const currentNumber = parseInt(rows[0].dealer_code.substring(1)) || 0;
      nextNumber = currentNumber + 1;
    }
    
    // Format with leading zeros (D001, D002, etc.)
    return `D${nextNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating dealer code:', error);
    // Fallback to timestamp-based code
    return `D${Date.now().toString().slice(-6)}`;
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate mobile number (10 digits)
 */
function isValidMobile(mobile) {
  return /^\d{10}$/.test(mobile);
}

// ==================== ROUTES ====================

/**
 * POST /api/signup/initiate
 * Step 1: Validate form data, store in pending_registrations, send OTP
 */
router.post('/initiate', async (req, res) => {
  try {
    console.log('📨 Received signup initiation request');
    
    const {
      userType,        // 'individual' or 'enterprise'
      dealerName,      // For enterprise: Dealer Name, For individual: Name
      mobileNumber,
      email,
      ownerName,       // For enterprise only (or same as dealerName for individual)
      ownerMobile,     // For enterprise only (or same as mobileNumber for individual)
      gstNumber,       // Enterprise only
      enterpriseType,  // Enterprise only
      password,
      confirmPassword
    } = req.body;

    // ==================== VALIDATION ====================
    
    // Required for all users
    if (!userType || !['individual', 'enterprise'].includes(userType)) {
      return res.status(400).json({
        success: false,
        error: 'Please select a valid user type (Individual or Enterprise)'
      });
    }

    if (!dealerName?.trim()) {
      return res.status(400).json({
        success: false,
        error: userType === 'individual' ? 'Name is required' : 'Dealer name is required'
      });
    }

    if (!email?.trim() || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email is required'
      });
    }

    if (!mobileNumber?.trim() || !isValidMobile(mobileNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Valid 10-digit mobile number is required'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
    }

    // Enterprise-specific validation
    if (userType === 'enterprise') {
      if (!ownerName?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Owner name is required for enterprise registration'
        });
      }

      if (!ownerMobile?.trim() || !isValidMobile(ownerMobile)) {
        return res.status(400).json({
          success: false,
          error: 'Valid owner mobile number is required'
        });
      }

      if (!gstNumber?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'GST number is required for enterprise registration'
        });
      }

      if (!enterpriseType) {
        return res.status(400).json({
          success: false,
          error: 'Enterprise type is required'
        });
      }
    }

    // ==================== CHECK EXISTING USERS ====================

    // Check if email already exists in users table
    const [existingEmail] = await db.execute(
      'SELECT email FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered. Please login instead.'
      });
    }

    // Check if mobile already exists
    const [existingMobile] = await db.execute(
      'SELECT mobile_number FROM users WHERE mobile_number = ?',
      [mobileNumber]
    );

    if (existingMobile.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number already registered'
      });
    }

    // ==================== GENERATE OTP ====================

    const otp = generateOTP(6);
    const otpExpiry = getOTPExpiry(10); // 10 minutes

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // ==================== STORE PENDING REGISTRATION ====================

    // Delete any existing pending registration for this email
    await db.execute('DELETE FROM pending_registrations WHERE email = ?', [email.toLowerCase()]);

    // For individual users, use dealerName as ownerName and mobileNumber as ownerMobile
    const finalOwnerName = userType === 'individual' ? dealerName : ownerName;
    const finalOwnerMobile = userType === 'individual' ? mobileNumber : ownerMobile;

    // Insert pending registration
    await db.execute(`
      INSERT INTO pending_registrations (
        user_type, dealer_name, mobile_number, email, owner_name, owner_mobile,
        gst_number, enterprise_type, password_hash, otp_code, otp_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userType,
      dealerName.trim(),
      mobileNumber,
      email.toLowerCase(),
      finalOwnerName.trim(),
      finalOwnerMobile,
      userType === 'enterprise' ? gstNumber : null,
      userType === 'enterprise' ? enterpriseType : 'individual',
      passwordHash,
      otp,
      otpExpiry
    ]);

    console.log(`✅ Pending registration created for ${email}`);

    // ==================== SEND OTP EMAIL ====================

    try {
      await sendOTPEmail(email, otp, dealerName);
      console.log(`📧 OTP email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      // Still return success - OTP is stored, can be resent
      return res.json({
        success: true,
        message: 'Registration initiated. There was an issue sending the email. Please try resending OTP.',
        email: email,
        otpSent: false,
        expiresIn: 10 * 60 // seconds
      });
    }

    return res.json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: email,
      otpSent: true,
      expiresIn: 10 * 60 // seconds
    });

  } catch (error) {
    console.error('❌ Signup initiation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


/**
 * POST /api/signup/verify-otp
 * Step 2: Verify OTP and complete registration
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }

    console.log(`🔐 Verifying OTP for ${email}`);

    // Get pending registration
    const [pendingRows] = await db.execute(
      'SELECT * FROM pending_registrations WHERE email = ? AND otp_code = ?',
      [email.toLowerCase(), otp]
    );

    if (pendingRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP. Please check and try again.'
      });
    }

    const pending = pendingRows[0];

    // Check if OTP expired
    if (new Date(pending.otp_expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.',
        expired: true
      });
    }

    // ==================== CREATE USER ====================

    // Generate dealer code
    const dealerCode = await generateDealerCode();
    console.log(`🎯 Generated dealer code: ${dealerCode}`);

    // Insert into users table
    const [result] = await db.execute(`
      INSERT INTO users (
        user_type, dealer_code, dealer_name, mobile_number, email,
        owner_name, owner_mobile, gst_number, cancel_cheque_photo,
        shop_photo, enterprise_type, password, email_verified, email_verified_at,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `, [
      pending.user_type,
      dealerCode,
      pending.dealer_name,
      pending.mobile_number,
      pending.email,
      pending.owner_name,
      pending.owner_mobile,
      pending.gst_number,
      pending.cancel_cheque_photo,
      pending.shop_photo,
      pending.enterprise_type,
      pending.password_hash
    ]);

    console.log(`✅ User created successfully - ID: ${result.insertId}, Code: ${dealerCode}`);

    // Delete pending registration
    await db.execute('DELETE FROM pending_registrations WHERE email = ?', [email.toLowerCase()]);

    // ==================== SEND WELCOME EMAIL ====================

    try {
      await sendWelcomeEmail(pending.email, pending.dealer_name, dealerCode);
      console.log(`📧 Welcome email sent to ${pending.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail the registration if welcome email fails
    }

    return res.json({
      success: true,
      message: 'Email verified successfully! Your account has been created.',
      dealerCode: dealerCode,
      userId: result.insertId,
      user: {
        dealerCode: dealerCode,
        dealerName: pending.dealer_name,
        email: pending.email,
        userType: pending.user_type
      }
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    
    // Handle duplicate entry errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'This email or mobile is already registered. Please try logging in.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Verification failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


/**
 * POST /api/signup/resend-otp
 * Resend OTP for pending registration
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    console.log(`🔄 Resending OTP for ${email}`);

    // Check if pending registration exists
    const [pendingRows] = await db.execute(
      'SELECT * FROM pending_registrations WHERE email = ?',
      [email.toLowerCase()]
    );

    if (pendingRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No pending registration found. Please start the signup process again.'
      });
    }

    const pending = pendingRows[0];

    // Generate new OTP
    const newOtp = generateOTP(6);
    const newExpiry = getOTPExpiry(10);

    // Update pending registration with new OTP
    await db.execute(
      'UPDATE pending_registrations SET otp_code = ?, otp_expires_at = ? WHERE email = ?',
      [newOtp, newExpiry, email.toLowerCase()]
    );

    // Send new OTP email
    try {
      await sendOTPEmail(email, newOtp, pending.dealer_name);
      console.log(`📧 New OTP sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to resend OTP email:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP email. Please try again.'
      });
    }

    return res.json({
      success: true,
      message: 'New OTP sent to your email.',
      email: email,
      expiresIn: 10 * 60
    });

  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to resend OTP. Please try again.'
    });
  }
});


module.exports = router;
