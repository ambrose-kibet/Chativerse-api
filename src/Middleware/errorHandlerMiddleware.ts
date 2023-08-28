import StatusCodes from 'http-status-codes';
import { Errback, Request, Response, NextFunction } from 'express';
const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something Went wrong',
  };
  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors)
      .map((item: any) => item.message)
      .join(',');
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }
  if (err.name === 'castError') {
    customError.msg = `No item with matching id '${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }
  if (err.code && err.code === 11000) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = `Value entered for  ${Object.keys(
      err.keyValue
    )} field already exists ,please choose a different value`;
  }
  res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandlerMiddleware;
