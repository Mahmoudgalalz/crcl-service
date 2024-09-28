import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { Logger } from '@nestjs/common';

const AppLogger = new Logger();
@Catch(HttpException)
export class ErrorResponse implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse<Response>();
    const theresponse: any = exception.getResponse();
    AppLogger.error(
      `(LOGS) Error - ${
        theresponse.message
      }\nStatus code : ${exception.getStatus()}.\nCause: ${
        exception.cause
      }\nStack: ${exception.stack}`,
    );
    if (exception.getStatus() == 400) {
      if (Array.isArray(theresponse.message)) {
        return response.status(422).json({
          status: 'error',
          message: 'Bad input data',
          error: this.reprocessError(theresponse.message),
        });
      }

      return response.status(400).json({
        status: 'error',
        message: theresponse.message,
      });
    } else {
      return response.status(exception.getStatus()).json({
        status: 'error',
        message: theresponse.message,
      });
    }
  }

  reprocessError(theErrors) {
    const errorField: any[] = [];
    theErrors.forEach((err) => {
      errorField.push(err.split(' ')[0]);
    });
    const errorSet = new Set(errorField);
    const errorArr = {};
    for (const errorItem of errorSet) {
      errorArr[`${errorItem}`] = [];
    }
    theErrors.forEach((err) => {
      const fieldName = err.split(' ')[0];
      if (fieldName in errorArr) {
        errorArr[fieldName] = err;
      }
    });
    return errorArr;
  }
}
