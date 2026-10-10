import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { localStore } from '../utils/localStore.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'RanjitTourTravels_2026_HP_RoyalRoute_SecretToken_Key#9816596713!';

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '7d'
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address.' });
    }
    const user = await User.create({ name, email, password, role: role || 'admin', phone });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }
    const cleanEmail = email.toLowerCase().trim();
    const masterAdminEmail = (process.env.ADMIN_EMAIL || 'admin@ranjittravels.com').toLowerCase().trim();
    const currentGlobalAdminPass = (localStore.getAdminPassword() || process.env.ADMIN_PASSWORD || 'Ranjit@123').replace(/^["']|["']$/g, '').trim();

    const isMasterPasswordInput = password === currentGlobalAdminPass;

    let user = null;
    let dbAvailable = false;
    try {
      user = await User.findOne({ 
        email: { 
          $in: [
            cleanEmail, 
            masterAdminEmail, 
            'admin@ranjittravels.com', 
            'admin@ranjittourandtravels.in', 
            'admin@ranjittourandtravels.com'
          ] 
        } 
      });
      dbAvailable = true;
    } catch (dbErr) {
      console.warn('[Auth DB Warning]:', dbErr.message);
    }

    const isMasterEmail = 
      cleanEmail === masterAdminEmail ||
      cleanEmail === 'admin@ranjittravels.com' ||
      cleanEmail === 'admin@ranjittourandtravels.in' ||
      cleanEmail === 'admin@ranjittourandtravels.com' ||
      cleanEmail === 'admin@ranjitravels.com' ||
      cleanEmail === 'admin' ||
      cleanEmail.startsWith('admin@');

    // Auto-bootstrap superadmin if not found in MongoDB and master credentials supplied
    if (dbAvailable && !user && isMasterEmail && isMasterPasswordInput) {
      try {
        user = new User({
          name: process.env.ADMIN_NAME || 'Super Admin (Ranjit Tours)',
          email: cleanEmail.includes('@') ? cleanEmail : masterAdminEmail,
          password: password,
          role: 'superadmin',
          phone: process.env.ADMIN_PHONE || '+919816596713',
          isActive: true
        });
        await user.save();
      } catch (saveErr) {
        console.warn('[Bootstrap Admin Save Error]:', saveErr.message);
      }
    }

    // For Admin / Superadmin accounts, strictly require Ranjit@123 only
    if (user && (user.role === 'superadmin' || user.role === 'admin' || isMasterEmail)) {
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
      }

      if (!isMasterPasswordInput) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Sync MongoDB user password to Ranjit@123
      try {
        user.password = password;
        await user.save();
      } catch (updateErr) {}

      const token = generateToken(user._id);
      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
      });
    }

    // Standard non-admin user authentication
    if (user) {
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
      const token = generateToken(user._id);
      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
      });
    }

    // Fallback if DB is initializing or empty: master credentials log in
    if (!user && isMasterEmail && isMasterPasswordInput) {
      const token = jwt.sign(
        { id: 'master_admin_fallback_id', email: 'admin@ranjittravels.com', role: 'superadmin' },
        getJwtSecret(),
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        token,
        user: {
          id: 'master_admin_fallback_id',
          name: process.env.ADMIN_NAME || 'Super Admin (Ranjit Tours)',
          email: 'admin@ranjittravels.com',
          role: 'superadmin',
          phone: process.env.ADMIN_PHONE || '+919816596713'
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const currentGlobalAdminPass = (localStore.getAdminPassword() || process.env.ADMIN_PASSWORD || 'Ranjit@123').replace(/^["']|["']$/g, '').trim();

    let user = null;
    try {
      if (req.user && req.user._id && req.user._id !== 'master_admin_fallback_id') {
        user = await User.findById(req.user._id);
      }
    } catch (e) {}

    let isCurrentValid = currentPassword === currentGlobalAdminPass;
    if (!isCurrentValid && user) {
      try {
        isCurrentValid = await user.comparePassword(currentPassword);
      } catch (err) {}
    }

    if (!isCurrentValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect. Please enter your valid active password.' });
    }

    // 1. Save new password globally in server store
    localStore.setAdminPassword(newPassword);

    // 2. Sync into MongoDB user document
    if (user) {
      user.password = newPassword;
      await user.save();
    } else {
      try {
        user = new User({
          name: (req.user && req.user.name) || 'Super Admin (Ranjit Tours)',
          email: (req.user && req.user.email) || 'admin@ranjittravels.com',
          password: newPassword,
          role: 'superadmin',
          phone: (req.user && req.user.phone) || '+919816596713',
          isActive: true
        });
        await user.save();
      } catch (saveErr) {}
    }

    return res.json({ 
      success: true, 
      message: 'Password successfully updated across the website! Your new password is now active and the old password is permanently deactivated.' 
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (req.user._id === 'master_admin_fallback_id') {
      return res.json({
        success: true,
        data: {
          id: 'master_admin_fallback_id',
          name: process.env.ADMIN_NAME || 'Super Admin (Ranjit Tours)',
          email: process.env.ADMIN_EMAIL || 'admin@ranjittravels.com',
          role: 'superadmin',
          phone: process.env.ADMIN_PHONE || '+919816596713'
        }
      });
    }
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user || req.user });
  } catch (err) {
    res.json({ success: true, data: req.user });
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const { name, phone, avatar, password } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (password) user.password = password;
    await user.save();
    res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, items: users, total: users.length });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed successfully.' });
  } catch (err) {
    next(err);
  }
};
