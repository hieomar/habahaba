import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import { prisma } from '../config/database.js';

export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required in Authorization header');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      throw new UnauthorizedError('User account associated with token no longer exists');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('User account is currently inactive or suspended');
    }

    const { passwordHash, ...safeUser } = user;
    req.user = {
      ...safeUser,
      roleCode: user.role.code,
      permissions: user.role.permissions,
    };

    next();
  } catch (error) {
    next(error);
  }
};
