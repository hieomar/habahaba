import * as farmService from '../services/farm.service.js';
import { sendSuccess } from '../utils/response.js';

export const createFarm = async (req, res, next) => {
  try {
    const farm = await farmService.createFarm(req.body, req.user);
    return sendSuccess(res, farm, 'Farm registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getFarmsByFarmer = async (req, res, next) => {
  try {
    const farms = await farmService.getFarmsByFarmer(req.params.farmerId);
    return sendSuccess(res, farms, 'Farms retrieved successfully');
  } catch (error) {
    next(error);
  }
};
