import { Injectable } from '@nestjs/common';

@Injectable()
export class OiService {
  constructor() {
  }
  getHello(): string {
    return 'Hello World from oi-nest!';
  }
}
