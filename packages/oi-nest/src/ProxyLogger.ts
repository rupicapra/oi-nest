import { Logger } from "@nestjs/common";
import { OiLoggerInterface } from "@openibex/core";

export class ProxyLogger implements OiLoggerInterface
{
  constructor(private logger: Logger) {

  }
  log(level: string, message: string): void {
    throw new Error("Method not implemented.");
  }
  info(message: string): void {
    this.logger.log(message);
  }
  warn(message: string): void {
    this.logger.warn(message);
  }
  error(message: string): void {
    this.logger.error(message);
  }

}