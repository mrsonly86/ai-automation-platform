import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Default error
  let status = 500;
  let message = 'Đã xảy ra lỗi server không mong muốn';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Dữ liệu đầu vào không hợp lệ';
  } else if (error.name === 'UnauthorizedError') {
    status = 401;
    message = 'Không có quyền truy cập';
  } else if (error.name === 'ForbiddenError') {
    status = 403;
    message = 'Truy cập bị từ chối';
  } else if (error.name === 'NotFoundError') {
    status = 404;
    message = 'Không tìm thấy tài nguyên';
  }

  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};