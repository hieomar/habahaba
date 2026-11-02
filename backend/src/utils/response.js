export const sendSuccess = (res, data = null, message = 'Operation successful', statusCode = 200, meta = null) => {
  const responsePayload = {
    success: true,
    message,
    data,
  };
  if (meta) {
    responsePayload.meta = meta;
  }
  return res.status(statusCode).json(responsePayload);
};

export const sendError = (res, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', details = null) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  });
};

export const sendPaginated = (res, data, page, limit, total, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit);
  return sendSuccess(res, data, message, 200, {
    page: Number(page),
    limit: Number(limit),
    total: Number(total),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
};
