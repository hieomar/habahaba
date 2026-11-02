import * as farmerService from '../services/farmer.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export const createFarmer = async (req, res, next) => {
  try {
    const farmer = await farmerService.createFarmer(req.body, req.user);
    return sendSuccess(res, farmer, 'Farmer registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getFarmers = async (req, res, next) => {
  try {
    const { farmers, total, page, limit } = await farmerService.getFarmers(req.query);
    return sendPaginated(res, farmers, page, limit, total, 'Farmers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getFarmerById = async (req, res, next) => {
  try {
    const farmer = await farmerService.getFarmerById(req.params.id);
    return sendSuccess(res, farmer, 'Farmer profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateFarmer = async (req, res, next) => {
  try {
    const updated = await farmerService.updateFarmer(req.params.id, req.body, req.user);
    return sendSuccess(res, updated, 'Farmer profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getFarmerGroups = async (req, res, next) => {
  try {
    const groups = await farmerService.getFarmerGroups();
    return sendSuccess(res, groups, 'Farmer groups and associations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getFarmerHistory = async (req, res, next) => {
  try {
    const history = await farmerService.getFarmerHistory(req.params.id);
    return sendSuccess(res, history, 'Farmer history retrieved successfully');
  } catch (error) {
    next(error);
  }
};
