import StatusCodes from 'http-status-codes';
class BadRequestError extends CustomAPIError {
  public statusCode: number;
  constructor(public message: string) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export default BadRequestError;
