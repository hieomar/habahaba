import { ForbiddenError } from '../utils/errors.js';

export const checkPermission = (moduleName, action = 'canRead') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('User context not established'));
    }

    // System Administrator role bypasses specific module permissions
    if (req.user.roleCode === 'SYSADMIN') {
      return next();
    }

    const permission = req.user.permissions.find(
      (p) => p.moduleName.toLowerCase() === moduleName.toLowerCase()
    );

    if (!permission || !permission[action]) {
      return next(
        new ForbiddenError(
          `Permission denied: Requires '${action}' right on '${moduleName}' module`
        )
      );
    }

    next();
  };
};
