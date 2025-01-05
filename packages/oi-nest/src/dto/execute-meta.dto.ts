import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEthereumAddress, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ExecuteSmartContractDto } from './execute-function.dto';
import { JsonKeystoreDto } from './jsonKeystore.dto';
import { Type } from 'class-transformer';



class Erc712Dto {
  @ApiProperty({
    description: 'The name of the EIP-712 domain (must match the domain name specified in [forwarder contract constructor](https://docs.openzeppelin.com/contracts/5.x/api/metatx#ERC2771Forwarder-constructor-string-))',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The version of the EIP-712 version (e.g., "1")',
    type: String,
  })
  @IsString()
  version: string;
}


export class MetaExecutionOptions {
  @ApiProperty({
    description: 'The Json-KeyStore of the signer wallet. This is *not* the gas-paying wallet!',
    type: () => JsonKeystoreDto,
  })
  @Type( () => JsonKeystoreDto)
  @ValidateNested()
  keystore: JsonKeystoreDto;

  @ApiProperty({
    description: 'The Password to unencrypt the Json-KeyStore',
    type: String,
    example: "supersecret"
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Address of the ERC-2771 forwarder contract',
    type: String,
  })
  @IsEthereumAddress()
  forwarder: string;

  @ApiProperty({
    description: "EIP-712 domain separator", 
    type: () => Erc712Dto
  })
  @ValidateNested()
  erc712: Erc712Dto;
}


export class ExecuteMetaDto extends ExecuteSmartContractDto {
  @ApiProperty({
    description: 'Information for ERC-2771 MetaTransaction-Forwarding',
    type: () => MetaExecutionOptions, // Explicitly specify the type
  })
  @ValidateNested()
  meta: MetaExecutionOptions; 
}
