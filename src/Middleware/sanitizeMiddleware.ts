import { filterXSS } from 'xss';
import { Request, Response, NextFunction } from 'express';
const sanitizeUserInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize user input in the request body by escaping special characters
  if (req.body) {
    for (const key in req.body) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        req.body[key] = filterXSS(req.body[key]);
      }
    }
  }
  next();
};
export default sanitizeUserInput;
