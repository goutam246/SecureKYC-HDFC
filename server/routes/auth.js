import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { dbHelpers } from '../database.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, mobile, password, name, username } = req.body;

    // Validation
    if (!email || !mobile || !password) {
      return res.status(400).json({ success: false, error: 'Email, mobile, and password are required' });
    }

    // Check if user already exists
    const existingUserByEmail = await dbHelpers.get(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    if (existingUserByEmail) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const existingUserByMobile = await dbHelpers.get(
      'SELECT id FROM users WHERE mobile = ?',
      [mobile]
    );
    if (existingUserByMobile) {
      return res.status(400).json({ success: false, error: 'An account with this mobile number already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate user ID and application ID
    const userId = `USR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const applicationId = `KYC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create user
    await dbHelpers.run(
      `INSERT INTO users (id, email, mobile, username, password_hash, name, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, datetime('now','localtime'), datetime('now','localtime'))`,
      [userId, email.toLowerCase(), mobile, username || null, passwordHash, name || null]
    );

    // Create initial KYC application
    await dbHelpers.run(
      `INSERT INTO kyc_applications (id, application_id, user_id, status, current_step, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, datetime('now','localtime'), datetime('now','localtime'))`,
      [uuidv4(), applicationId, userId, 'in_progress', 1]
    );

    res.json({
      success: true,
      user: {
        id: userId,
        email,
        mobile,
        name,
        applicationId
      },
      applicationId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user
    const user = await dbHelpers.get(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Get application ID
    const application = await dbHelpers.get(
      'SELECT application_id FROM kyc_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        username: user.username,
        applicationId: application?.application_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Login with Application ID
router.post('/login/app-id', async (req, res) => {
  try {
    const { applicationId, password } = req.body;

    if (!applicationId || !password) {
      return res.status(400).json({ success: false, error: 'Application ID and password are required' });
    }

    // Find application and user
    const application = await dbHelpers.get(
      `SELECT k.*, u.* FROM kyc_applications k 
       JOIN users u ON k.user_id = u.id 
       WHERE k.application_id = ?`,
      [applicationId.toUpperCase()]
    );

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application ID not found' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, application.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    res.json({
      success: true,
      user: {
        id: application.user_id,
        email: application.email,
        mobile: application.mobile,
        name: application.name,
        username: application.username,
        applicationId: application.application_id
      }
    });
  } catch (error) {
    console.error('Application ID login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Get user by ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await dbHelpers.get(
      'SELECT id, email, mobile, username, name FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
});

export default router;


