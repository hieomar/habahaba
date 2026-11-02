import * as inventoryService from '../services/inventory.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export const getInventory = async (req, res, next) => {
  try {
    const warehouseId = req.query.warehouseId;
    const inventory = await inventoryService.getInventoryByWarehouse(warehouseId);
    return sendSuccess(res, inventory, 'Warehouse inventory retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getStockMovements = async (req, res, next) => {
  try {
    const { movements, total, page, limit } = await inventoryService.getStockMovements(req.query);
    return sendPaginated(res, movements, page, limit, total, 'Stock movement history retrieved successfully');
  } catch (error) {
    next(error);
  }
};
