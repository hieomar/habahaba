import * as customerService from '../services/customer.service.js';
import { sendSuccess } from '../utils/response.js';

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body, req.user);
    return sendSuccess(res, customer, 'Customer registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await customerService.getCustomers();
    return sendSuccess(res, customers, 'Commercial buyer customers retrieved successfully');
  } catch (error) {
    next(error);
  }
};
