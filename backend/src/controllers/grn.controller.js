import * as grnService from '../services/grn.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export const createGRN = async (req, res, next) => {
  try {
    const grn = await grnService.createGRN(req.body, req.user);
    return sendSuccess(res, grn, 'Goods Received Note issued successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getGRNs = async (req, res, next) => {
  try {
    const { grns, total, page, limit } = await grnService.getGRNs(req.query);
    return sendPaginated(res, grns, page, limit, total, 'GRN records retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getGRNById = async (req, res, next) => {
  try {
    const grn = await grnService.getGRNById(req.params.id);
    return sendSuccess(res, grn, 'GRN details retrieved successfully');
  } catch (error) {
    next(error);
  }
};
