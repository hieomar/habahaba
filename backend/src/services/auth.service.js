import { prisma } from '../config/database.js';
import { comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';

export const loginUser = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
      assignedIpc: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password credentials');
  }

  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedError('User account is currently inactive or suspended');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password credentials');
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
    roleCode: user.role.code,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Record Login Action in Audit Log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      action: 'LOGIN',
      module: 'Authentication',
      details: `User ${user.email} logged in successfully`,
    },
  });

  const { passwordHash, ...safeUser } = user;

  return {
    user: {
      ...safeUser,
      permissions: user.role.permissions,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshUserToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new UnauthorizedError('Refresh token required');
  }

  const decoded = verifyRefreshToken(incomingRefreshToken);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: {
      role: true,
    },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Invalid refresh token or inactive account');
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
    roleCode: user.role.code,
  };

  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
      assignedIpc: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User profile not found');
  }

  const { passwordHash, ...safeUser } = user;
  return safeUser;
};
