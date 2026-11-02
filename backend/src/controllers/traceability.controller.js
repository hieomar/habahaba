import * as traceabilityService from '../services/traceability.service.js';
import { sendSuccess } from '../utils/response.js';

export const traceGrainLineage = async (req, res, next) => {
  try {
    const code = req.query.code;
    const lineage = await traceabilityService.traceGrainLineage(code);
    return sendSuccess(res, lineage, 'Traceability chain of custody retrieved successfully');
  } catch (error) {
    next(error);
  }
};
