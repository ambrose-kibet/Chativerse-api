import StatusCodes from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(StatusCodes.NOT_FOUND).send('Route does not exists');
};

export default notFoundMiddleware;
