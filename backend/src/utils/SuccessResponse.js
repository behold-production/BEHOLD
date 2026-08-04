class SuccessResponse {
  constructor(res, message = 'Success', data = null, statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }
}

module.exports = SuccessResponse;
