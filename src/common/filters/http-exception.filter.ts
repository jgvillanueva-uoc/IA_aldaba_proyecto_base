/**
 * Global exception filter that normalizes API error payloads.
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ERROR_CODES } from '../constants/error-codes';
import { DomainException } from '../exceptions/domain.exception';

interface ErrorBody {
  readonly statusCode: number;
  readonly error: string;
  readonly message: string;
  readonly timestamp: string;
  readonly path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Maps thrown exceptions into the unified API error shape.
   * @param exception Any thrown value from the request pipeline.
   * @param host Nest execution context with request/response objects.
   */
  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const payload = this.mapException(exception, request.url);
    response.status(payload.statusCode).json(payload);
  }

  /**
   * Converts different exception types into a standard error body.
   * @param exception Thrown value.
   * @param path Request path for traceability.
   * @returns Normalized payload consumed by API clients.
   */
  private mapException(exception: unknown, path: string): ErrorBody {
    if (exception instanceof DomainException) {
      return {
        statusCode: exception.statusCode,
        error: exception.errorCode,
        message: exception.message,
        timestamp: new Date().toISOString(),
        path,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode: number = exception.getStatus();
      const rawResponse: unknown = exception.getResponse();
      const message: string = this.extractHttpExceptionMessage(
        rawResponse,
        exception.message,
      );

      return {
        statusCode,
        error:
          statusCode === 400
            ? ERROR_CODES.VALIDATION_ERROR
            : ERROR_CODES.INTERNAL_ERROR,
        message,
        timestamp: new Date().toISOString(),
        path,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: ERROR_CODES.INTERNAL_ERROR,
      message: 'Unexpected internal error',
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Extracts a readable message from HttpException response payloads.
   * @param rawResponse Raw payload returned by HttpException.getResponse().
   * @param fallbackMessage Message used when payload has no readable message.
   * @returns String message for API response.
   */
  private extractHttpExceptionMessage(
    rawResponse: unknown,
    fallbackMessage: string,
  ): string {
    if (typeof rawResponse === 'string') {
      return rawResponse;
    }

    if (
      typeof rawResponse === 'object' &&
      rawResponse !== null &&
      'message' in rawResponse
    ) {
      const value = (rawResponse as { message: unknown }).message;

      if (Array.isArray(value)) {
        return value.join(', ');
      }

      if (typeof value === 'string') {
        return value;
      }
    }

    return fallbackMessage;
  }
}
