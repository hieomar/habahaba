import * as masterdataService from '../services/masterdata.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export const getCommodities = async (req, res, next) => {
  try {
    const data = await masterdataService.getCommodities();
    return sendSuccess(res, data, 'Commodities retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getIPCs = async (req, res, next) => {
  try {
    const data = await masterdataService.getIPCs();
    return sendSuccess(res, data, 'IPCs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getWarehouses = async (req, res, next) => {
  try {
    const data = await masterdataService.getWarehouses();
    return sendSuccess(res, data, 'Warehouses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMarketingCentres = async (req, res, next) => {
  try {
    const data = await masterdataService.getMarketingCentres();
    return sendSuccess(res, data, 'Marketing Centres retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { logs, total, page, limit } = await masterdataService.getAuditLogs(req.query);
    return sendPaginated(res, logs, page, limit, total, 'Audit logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await masterdataService.getNotifications(req.user?.id);
    return sendSuccess(res, notifications, 'Notifications retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getSummaryReport = async (req, res, next) => {
  try {
    const report = await masterdataService.getSystemSummaryReport();
    return sendSuccess(res, report, 'System summary analytics retrieved successfully');
  } catch (error) {
    next(error);
  }
};
