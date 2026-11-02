import * as batchService from '../services/batch.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export const createBatch = async (req, res, next) => {
  try {
    const batch = await batchService.createBatch(req.body, req.user);
    return sendSuccess(res, batch, 'Storage lot batch created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getBatches = async (req, res, next) => {
  try {
    const { batches, total, page, limit } = await batchService.getBatches(req.query);
    return sendPaginated(res, batches, page, limit, total, 'Batches retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getBatchById = async (req, res, next) => {
  try {
    const batch = await batchService.getBatchById(req.params.id);
    return sendSuccess(res, batch, 'Batch details retrieved successfully');
  } catch (error) {
    next(error);
  }
};
