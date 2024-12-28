import { Injectable, Logger } from '@nestjs/common';
import semver from 'semver';

@Injectable()
export class OiService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger(OiService.name);

    if(!this.checkNodeEnv()) {
      throw new Error("Incompatible runtime detected.")
    }

    this.logger.log("Initialized")
  }
  getHello(): string {
    return 'Hello World from oi-nest!';
  }

    /**
   * Function to check if the Node.js version is 22 or higher
   * and if NODE_OPTIONS includes '--experimental-require-module'.
   *
   * @returns {boolean} True if both conditions are met, false otherwise.
   */
  checkNodeEnv(): boolean {
    // Get the current Node.js version
    const nodeVersion = process.version; // Example: 'v22.0.0'

    // Check if the version is 22 or higher using semver
    const minVersion = '>=22.0.0';

    if (!semver.satisfies(nodeVersion, minVersion)) {
        this.logger.error(`Node.js version is too low, expect ${minVersion}. Detected: ${nodeVersion}`);
        return false;
    }

    // Check if NODE_OPTIONS includes '--experimental-require-module'
    const nodeOptions = process.env.NODE_OPTIONS || '';
    if (!nodeOptions.includes('--experimental-require-module')) {
        this.logger.error("'NODE_OPTIONS' does not include '--experimental-require-module'.");
        return false;
    }

    // If both checks pass
    return true;
  }

}
