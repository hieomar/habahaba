import * as adminService from '../services/admin.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export const getUsers = async (req, res, next) => {
  try {
    const { users, total, page, limit } = await adminService.getUsers(req.query);
    return sendPaginated(res, users, page, limit, total, 'User registry retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body, req.user);
    return sendSuccess(res, user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updated = await adminService.updateUser(req.params.id, req.body, req.user);
    return sendSuccess(res, updated, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req, res, next) => {
  try {
    const roles = await adminService.getRoles();
    return sendSuccess(res, roles, 'System roles and permissions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateRolePermissions = async (req, res, next) => {
  try {
    const updatedRole = await adminService.updateRolePermissions(req.params.id, req.body.permissions, req.user);
    return sendSuccess(res, updatedRole, 'Role permissions updated successfully');
  } catch (error) {
    next(error);
  }
};
