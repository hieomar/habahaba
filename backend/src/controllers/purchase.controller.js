import * as purchaseService from '../services/purchase.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export const createPurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.createPurchase(req.body, req.user);
    return sendSuccess(res, purchase, 'Commodity purchase recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getPurchases = async (req, res, next) => {
  try {
    const { purchases, total, page, limit } = await purchaseService.getPurchases(req.query);
    return sendPaginated(res, purchases, page, limit, total, 'Purchases retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await purchaseService.getPurchaseById(req.params.id);
    return sendSuccess(res, purchase, 'Purchase receipt details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const updated = await purchaseService.updatePaymentStatus(req.params.id, req.body, req.user);
    return sendSuccess(res, updated, 'Payment status updated successfully');
  } catch (error) {
    next(error);
  }
};
