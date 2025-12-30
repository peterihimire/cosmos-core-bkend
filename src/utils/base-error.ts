class BaseError extends Error {
  constructor(public message: string, public errorCode: number) {
    super(message);
    this.errorCode = errorCode;
    Error.captureStackTrace(this);
  }
}
export default BaseError;
