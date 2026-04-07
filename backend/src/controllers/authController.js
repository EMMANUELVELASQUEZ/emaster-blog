const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: send tokens response
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store refresh token in DB (hashed)
  const hashedRefresh = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(hashedRefresh);
  // Keep max 5 refresh tokens (multi-device)
  if (user.refreshTokens.length > 5) user.refreshTokens.shift();
  user.lastLogin = Date.now();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Prevent self-assigning admin
  const safeRole = ['reader', 'author'].includes(role) ? role : 'reader';

  const user = await User.create({ name, email, password, role: safeRole });
  const verifyToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Send verification email via nodemailer
  // await sendEmail({ to: user.email, subject: 'Verify Email', token: verifyToken });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password.' });
  }

  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, error: 'Account deactivated.' });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Google OAuth Login
// @route   POST /api/v1/auth/google
// @access  Public
exports.googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { sub: googleId, email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ $or: [{ googleId }, { email }] }).select('+refreshTokens');

  if (!user) {
    user = await User.create({
      googleId,
      email,
      name,
      avatar: picture,
      isEmailVerified: true,
      role: 'reader',
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.avatar = user.avatar || picture;
    await user.save({ validateBeforeSave: false });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public (requires valid refresh token cookie)
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'No refresh token.' });
  }

  const jwt = require('jsonwebtoken');
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(hashed)) {
    return res.status(401).json({ success: false, error: 'Invalid refresh token.' });
  }

  // Rotate refresh token
  user.refreshTokens = user.refreshTokens.filter((t) => t !== hashed);
  sendTokenResponse(user, 200, res);
});

// @desc    Logout
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { refreshTokens: hashed },
    });
  }

  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('postsCount');
  res.json({ success: true, data: user });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ success: false, error: 'No user with that email.' });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Send reset email
  // await sendEmail({ to: user.email, resetToken });

  res.json({ success: true, message: 'Password reset email sent.' });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid or expired token.' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
