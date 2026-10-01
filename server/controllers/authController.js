import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
    const masterAdminPass = (process.env.ADMIN_PASSWORD || 'Ranjit#Amb@2026!Secure').replace(/^["']|["']$/g, '').trim();

    let user = await User.findOne({ email: cleanEmail });

    // Auto-bootstrap superadmin if not found in MongoDB and master credentials supplied
    if (!user && cleanEmail === masterAdminEmail && (password === masterAdminPass || password === 'Ranjit#Amb@2026!Secure')) {
      user = new User({
        name: process.env.ADMIN_NAME || 'Super Admin (Ranjit Tours)',
        email: cleanEmail,
        password: password,
        role: 'superadmin',
        phone: process.env.ADMIN_PHONE || '+919816596713',
        isActive: true
      });
      await user.save();
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact administrator.' });
    }

    // Authenticate exclusively with the user's active password in MongoDB
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
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
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect. Please enter your valid current password.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully! Your new password is now active and required for all future logins.' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
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
