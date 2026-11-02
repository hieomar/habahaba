import * as syncService from '../services/sync.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export const pushSync = async (req, res, next) => {
  try {
    const result = await syncService.processPushSync(req.body, req.user);
    return sendSuccess(res, result, 'Mobile offline batch data synchronized successfully');
  } catch (error) {
    next(error);
  }
};

export const pullSeed = async (req, res, next) => {
  try {
    const seedData = await syncService.getPullSeedData(req.user?.assignedIpcId);
    return sendSuccess(res, seedData, 'Initial seed data retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getSyncLogs = async (req, res, next) => {
  try {
    const { logs, total, page, limit } = await syncService.getSyncLogs(req.query);
    return sendPaginated(res, logs, page, limit, total, 'Mobile sync logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};
