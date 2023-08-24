import StatusCodes from 'http-status-codes';

class UnauthorizedError extends CustomAPIError {
  public statusCode: number;
  constructor(public message: string) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

export default UnauthorizedError;
