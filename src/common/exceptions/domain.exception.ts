/**
 * Domain-level exception used to return controlled business errors.
 */
import { HttpStatus } from '@nestjs/common';
import type { ErrorCode } from '../constants/error-codes';

export class DomainException extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;

  /**
   * Creates a domain exception with status and business code.
   * @param message Human-readable error message.
   * @param errorCode Stable machine-readable error code.
   * @param statusCode HTTP status returned by the API.
   */
  public constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    super(message);
    this.name = 'DomainException';
    this.errorCode = errorCode;
    this.statusCode = statusCode;
  }
}
