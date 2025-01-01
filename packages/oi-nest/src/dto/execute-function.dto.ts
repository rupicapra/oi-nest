import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ExecuteSmartContractOptions {
  
  @ApiProperty({
    description: 'The wallet address executing the function',
    type: String,
    example: '0x123456789abcdef',
  })
  @IsString()
  wallet?: string;

  @ApiProperty({
    description: 'Additional details about the execution',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  details?: boolean;
  
}

export class ExecuteSmartContractDto {
  @ApiProperty({
    description: 'The artifact name of the smart contract',
    type: String,
    example: "eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3"
  })
  @IsString()
  artifact: string;

  @ApiProperty({
    description: 'The function name in the smart contract',
    type: String,
    example: "balanceOf"
  })
  @IsString()
  function_name: string;

  @ApiProperty({
    description: 'The arguments for the smart contract function',
    type: [String],
    example: ["0x6d4cc96bd9135c25cbcaa4d38a0b514798a60360"]
  })
  @IsArray()
  @IsString({ each: true })
  args: string[];

  @ApiProperty({
    description: 'Optional execution options for the smart contract function',
    type: Object,
    required: false,
    example: {
      wallet: 'alice',
      details: true,
    },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  options?: ExecuteSmartContractOptions
}
