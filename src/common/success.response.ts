import { Logger } from '@nestjs/common';

const AppLogger = new Logger();

export class SuccessResponse {
  message: string;
  data: unknown;
  others: { [key: string]: any }[];

  constructor(
    message = 'successful',
    data: unknown = null,
    ...others: { [key: string]: any }[]
  ) {
    this.message = message;
    this.data = data;
    this.others = others;
  }

  toJSON() {
    AppLogger.log(`(LOGS) Success - ${this.message}`);

    let data: any = {
      status: 'success',
      message: this.message,
    };
    if (this.data) {
      data.data = this.data;
    }

    if (this.others) {
      this.others.forEach((val) => {
        data = { ...data, ...val };
      });
    }

    return data;
  }
}
