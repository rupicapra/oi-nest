import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getOiCore, initApp, OiConfig, OiCore } from '@openibex/core';
import semver from 'semver';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ProxyLogger } from './ProxyLogger';
import { promises as fsPromises, readFileSync, writeFileSync } from 'fs';
import { AssetType} from 'caip';
import JSONbig from 'json-bigint';
import {OiChain, OiContractAPI} from '@openibex/chain';

// Each plugin that should be loaded needs to be imported here EXPLICITELY
// This is paramount for the plugins-system
import '@openibex/chain';
import '@openibex/ethereum';
import './erc2771';

import { ExecuteSmartContractDto } from './dto/execute-function.dto';
import { GenerateKeystoreDto } from './dto/generate-keystore.dto';
import { Contract, HDNodeWallet, Wallet } from 'ethers';
import { ExecuteMetaDto } from './dto/execute-meta.dto';
import { VerifyKeystoreDto } from './dto/verify-keystore.dto';
import { JsonKeystoreDto } from './dto/jsonKeystore.dto';
import { Erc2771Api } from './erc2771/api';
import { ConnectDto } from './dto/connect.dto';

// setup-directory needs to contain at least a config.yaml
// TODO OI_BOOTSTRAP ... path do setup directory
// TODO OI_DATA_DIR ... writeable persistent data directory
// TODO Docs Environment-Variables: OI_CONFIG_FILE ... path to config


@Injectable()
export class OiService implements OnModuleInit {
  private logger: ProxyLogger;
  private core: OiCore;
  private data_dir: string = path.resolve(process.env.OI_DATA_DIR || './oi_data/');
  private config_path: string = path.resolve(process.env.OI_CONFIG_FILE || path.join(this.data_dir, 'config.yaml'));
  

  private _getConfigPath(): string {
    return this.config_path;
  }

  loadConfig(): OiConfig {
    const configPath = this._getConfigPath();

    try {
      const configFile = fs.readFileSync(configPath, 'utf8');
      const configInstance = yaml.load(configFile) as OiConfig;
  
      return configInstance;
    } catch (error) {
      throw new Error(`Failed to load config: ${error.message}`);
    }
  }

  async writeConfig(newConfig: OiConfig): Promise<void> {
    const configPath = this._getConfigPath();

    this.logger.info(`Write config to ${configPath}`);

    try {
      const configFile = fs.writeFileSync(configPath, yaml.dump(newConfig), {encoding: 'utf-8'});  
    } catch (error) {
      throw new Error(`Failed to write config: ${error.message}`);
    }
  }

  constructor() {
    this.logger = new ProxyLogger(new Logger(OiService.name));

    if(!this.checkNodeEnv()) {
      throw new Error("Incompatible runtime detected.")
    }

    if(!this.data_dir) {
      throw new Error("OS_DATA_DIR environment variable needs to be set.")
    }

    this.boostrap();
  }

  async onModuleInit(): Promise<void> {
      await this.startup();
  }

  getHello(): string {
    return 'Hello World from oi-nest!';
  }

    /**
   * Function to check if the Node.js version is 22 or higher
   * and if NODE_OPTIONS includes '--experimental-require-module'.
   * 
   * The --experimental-require-module is necessary because NestJS only supports CommonJS, while
   * OpenIbex is actually an ES-Module and does not provide CommonJS files.
   * This allows to use OpenIbex in NestJS just as if it would have a CommonJS interface.
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



  async startup(): Promise<void>  {
    this.logger.info(`Startup from at ${this._getConfigPath()}...`);

    let config = this.loadConfig();

    if(!config.database.address) {
      await this.initializeOi();
    }

    // Reload the config
    config = this.loadConfig();

    if(!config.database.address) {
      throw new Error("OpenIbex not initialized, config.database.address missing.");
    }  

    this.core = await getOiCore(config, this.logger);
    
    if(!this.core.isInitialized()) {
      throw new Error("OpenIbex core loaded but not initialized for unknown reasons. Happy Debugging.")
    }    
  }


  private async canOverwriteFile(filePath: string): Promise<boolean> {
    try {
      // Check if the file exists
      await fsPromises.access(filePath, fsPromises.constants.W_OK);
      // If no error, you have write permission
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File does not exist, so it can be created
        return true;
      }
      // Other errors indicate lack of permissions
      return false;
    }
  }

  canWriteDir(dirname: string): boolean {
    try {
      fs.accessSync(dirname, fs.constants.W_OK);
      return true;
    } catch(e) {
      return false;
    }
  }

  nrFilesInDir(dirname): number {
    return fs.readdirSync(dirname, {recursive:true}).length;

  }
  isDirEmpty(dirname) {
    return this.nrFilesInDir(dirname) === 0;
  }

  boostrap() {
    const bootstrapFile = path.join(this.data_dir, 'bootstrapped.date');
    
    this.logger.info(`Starting from data directory ${this.data_dir}`);

    // On each startup, verify I can still write the data directory
    if(!this.canWriteDir(this.data_dir)) {
      throw new Error(`Cannot write data directory: ${this.data_dir}`);
    }

    if(fs.existsSync(bootstrapFile)) {
      this.logger.info(`Bootstraping was done ${readFileSync(bootstrapFile, { encoding: 'utf-8' })})`);
      return;
    }    

    // Check if directory is empty
    if(!this.isDirEmpty(this.data_dir)) {
      throw new Error(`Data dir has no bootstrap file, but is also non-empty: ${this.data_dir}`);
    }

    const bootstrap_dir = path.resolve(process.env.OS_BOOTSTRAP_DIR || './oi_init/');

    // Ok, so we have a writable empty directory, check what we shall write...
    if(this.isDirEmpty(bootstrap_dir)) {
      throw new Error(`OS_BOOTSTRAP_DIR is empty: ${process.env.OS_BOOTSTRAP_DIR}`);
    }

    this.logger.info(`Bootstrap: Copy files from ${bootstrap_dir} to ${this.data_dir}`);
    fs.cpSync(bootstrap_dir, this.data_dir, {recursive:true});
    this.logger.info(`Copied ${this.nrFilesInDir(this.data_dir)} files and/or directories`);
    
    // Create bootstrap file
    writeFileSync(bootstrapFile, new Date().toISOString(), { encoding: 'utf-8' });
  }

  async initializeOi(): Promise<void> {
    this.logger.info("Initializing OpenIbex - this method can only run once.")


    const config = this.loadConfig();

    if(config.database.address) {
      throw new Error(`Config already initialized, DB-Address defined to be at ${config.database.address}`);
    }

    if(!(await this.canOverwriteFile(this._getConfigPath()))) {
      throw new Error(`Initialization stopped, cannot overwrite config at ${this._getConfigPath()}`);
    }

    const address = await initApp(config, this.logger);
    this.logger.info(`Initialized for address ${address}`)
    config.database.address = address;

    await this.writeConfig(config);     
  }

  async generateKeystore(data: GenerateKeystoreDto) {
    const wallet = new Wallet(data.private_key);
    const keystore = wallet.encrypt(data.password);
    return keystore;
  }

  // actual endpoints
  async execute(data: ExecuteSmartContractDto): Promise<Object> {
    this.logger.info(`Executing function call with: ${data.artifact}`);

    const assetArtifact = new AssetType(data.artifact);

    const chain: OiChain = this.core.getService('openibex.chain', 'chain') as unknown as OiChain;
    const api = chain.contract(assetArtifact).getAPI(data.options?.wallet)

    this.logger.info(`API created with ${data.options.wallet ? `wallet ${data.options.wallet}`: 'no wallet'}.`);
    
    const returnValue = await api.execute(data.function_name, data.args)
    this.logger.info(`Calling function '${data.function_name}' returns ${returnValue}`);
    return returnValue;
  }


  async executeMeta(data: ExecuteMetaDto): Promise<Object> {

    const assetArtifact = new AssetType(data.artifact);

    const chain: OiChain = this.core.getService('openibex.chain', 'chain') as unknown as OiChain;
    const api = chain.contract(assetArtifact).getAPI();

    const invokedContract = await api.getRawContract();
    const signerWallet = await this.walletFromKeystore(data.meta.keystore, data.meta.password);

    const erc2771Forwarder = new AssetType(`${assetArtifact.chainId.namespace}:${assetArtifact.chainId.reference}/erc2771:${data.meta.forwarder}`);
    const forwarderAPI = chain.contract(erc2771Forwarder).getAPI(data.options?.wallet) as unknown as Erc2771Api;

    const signingDomain = {name: data.meta.erc712.name, version: data.meta.erc712.version};
    try {

      this.logger.info(`${assetArtifact.toString()} via ERC2771-Forwarder ${erc2771Forwarder.toString()}: ${data.function_name}(${data.args}). [erc721: ${JSON.stringify(signingDomain)}]`)
      const receipt = await forwarderAPI.forwardRequest(invokedContract, signerWallet, data.function_name, data.args, signingDomain );
      this.logger.info(`Successfully executed: ${JSONbig.stringify(receipt)}`);
      return receipt;
    } catch(error: any) {
      // convert into http status errors
      this.logger.warn(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async verifyKeystore(data: VerifyKeystoreDto): Promise<Object> {
    const wallet= await this.walletFromKeystore(data.keystore, data.password);
    return {"hello": "world"};
  }

  async walletFromKeystore(data: JsonKeystoreDto, password: string): Promise<Wallet> {
    try {
      // Decrypt the keystore and create a wallet
      const wallet = await Wallet.fromEncryptedJson(JSON.stringify(data), password);
      return wallet as Wallet;
    } catch (error) {
      console.error("Failed to load wallet:", error);
    }
  }

  async startConnector(data: ConnectDto): Promise<Object> {
    const assetArtifact = new AssetType(data.artifact);

    const params = {
      index: false, // TODO support this as parameter!
      startBlock: data.startBlock ? data.startBlock : 0
    }

    const chain: OiChain = this.core.getService('openibex.chain', 'chain') as unknown as OiChain;
    const connector = chain.contract(assetArtifact).getConnector(params);

    this.logger.info(`Connector for ${data.artifact} initializing: Creating datasets and initializing connections.`);
    await connector.init();
    this.logger.info('Connector for ${data.artifact} starting');
    await connector.start();
    this.logger.info(`Connector ${data.artifact} started and processing.`);

    return {"artifact": data.artifact, "status": "running"};
  }

  public getAPI(artifact: string, walletName: string | undefined = undefined): OiContractAPI {
    const assetArtifact = new AssetType(artifact);

    const chain: OiChain = this.core.getService('openibex.chain', 'chain') as unknown as OiChain;
    // TODO change as soon as we have instant-keystores supported in OpenIbex
    const api = chain.contract(assetArtifact).getAPI(walletName);
    return api;
  }


  private async eventProxy(contract: Contract, event, record) {
    console.log("event proxy :) ")
    console.log(JSONbig.stringify(event));
    console.log(JSONbig.stringify(record));
    
  }  
  


}
