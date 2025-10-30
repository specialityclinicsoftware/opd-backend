import { User } from '../models/user';
import { generateTokens, verifyToken } from '../utils/jwt';
import logger from '../config/logger';

/**
 * Login user with email and password
 */
export const login = async (email: string, password: string) => {
  try {
    // Find user by email
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      throw new Error('Invalid email or password');
    }


    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user);

    logger.info(`User logged in successfully: ${user.email}`);

    return {
      user: user.toJSON(),
      ...tokens,
    };
  } catch (error: any) {
    logger.error(`Login error: ${error.message}`);
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (refreshToken: string) => {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    logger.info(`Token refreshed for user: ${user.email}`);

    return tokens;
  } catch (error: any) {
    logger.error(`Token refresh error: ${error.message}`);
    throw error;
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async (userId: string) => {
  try {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error: any) {
    logger.error(`Get current user error: ${error.message}`);
    throw error;
  }
};

/**
 * Logout user (client-side token removal)
 */
export const logout = async (userId: string) => {
  try {
    logger.info(`User logged out: ${userId}`);
    return { message: 'Logged out successfully' };
  } catch (error: any) {
    logger.error(`Logout error: ${error.message}`);
    throw error;
  }
};

/**
 * Change user password
 */
export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    return { message: 'Password changed successfully' };
  } catch (error: any) {
    logger.error(`Change password error: ${error.message}`);
    throw error;
  }
};
