import { Injectable } from '@nestjs/common';
import { OiService } from '@rupicapra/oi-nest';

@Injectable()
export class AppService {

  constructor(private readonly oi: OiService) {}

  onApplicationBootstrap() {
    // This is how you would typically start a connector programmatically
    // Since this is done in onApplicationBootstrap() this also ensures that the connector is started once and it stays connected for as long as the application
    // is running
    // this.oi.startConnector({artifact: "eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3"})
  }
}
