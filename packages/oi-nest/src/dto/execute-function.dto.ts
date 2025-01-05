import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ExecuteSmartContractOptions {
  
  @ApiProperty({
    description: 'The wallet address or wallet-name (from config.yaml), which shall be used when executing a function',
    type: String,
    example: 'alice',
  })
  @IsString()
  wallet?: string;  
}

export class ExecuteSmartContractDto {
  @ApiProperty({
    description: 'The smart contract in CAIP adressing scheme. Typically follows `eip155:<chainId>:<protocolName>:<address>`. The protocol either needs to be protocol provided by OpenIbex or a custom protocol, which is implemented and registered via plugin system. Note that the chainId needs to be specified in config.yaml.',    type: String,
    example: "eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3"
  })
  @IsString()
  artifact: string;

  @ApiProperty({
    description: 'The function name in the smart contract',
    type: String,
    example: "transfer"
  })
  @IsString()
  function_name: string;

  @ApiProperty({
    description: 'The arguments for the smart contract function, all provided as strings. Integers are automatically parsed.',
    type: [String],
    example: ["0x6d4cc96bd9135c25cbcaa4d38a0b514798a60360", "1234"]
  })
  @IsArray()
  @IsString({ each: true })
  args: string[];

  @ApiProperty({
    description: 'Optional execution options for the smart contract function. Required when executing a function, as wallet needs to be provided',
    type: Object,
    required: false,
    example: {
      wallet: 'alice',
    },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  options?: ExecuteSmartContractOptions
}
