import * as dispatchService from '../services/dispatch.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export const createDispatch = async (req, res, next) => {
  try {
    const dispatch = await dispatchService.createDispatch(req.body, req.user);
    return sendSuccess(res, dispatch, 'Dispatch waybill issued successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getDispatches = async (req, res, next) => {
  try {
    const { dispatches, total, page, limit } = await dispatchService.getDispatches(req.query);
    return sendPaginated(res, dispatches, page, limit, total, 'Dispatches retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getDispatchById = async (req, res, next) => {
  try {
    const dispatch = await dispatchService.getDispatchById(req.params.id);
    return sendSuccess(res, dispatch, 'Dispatch details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const markDispatchDelivered = async (req, res, next) => {
  try {
    const updated = await dispatchService.markDispatchDelivered(req.params.id, req.body, req.user);
    return sendSuccess(res, updated, 'Dispatch status updated to DELIVERED successfully');
  } catch (error) {
    next(error);
  }
};
