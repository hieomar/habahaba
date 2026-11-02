import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

    // Set Refresh Token in HTTP-Only Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(
      res,
      {
        user,
        accessToken,
      },
      'User logged in successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshUserToken(incomingRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(
      res,
      { accessToken },
      'Token refreshed successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return sendSuccess(res, null, 'User logged out successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userProfile = await authService.getUserProfile(req.user.id);
    return sendSuccess(res, { user: userProfile }, 'User profile retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};
