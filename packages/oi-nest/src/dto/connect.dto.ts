import { ApiBadGatewayResponse, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';



export class ConnectDto {
  @ApiProperty({
    description: 'The smart contract in CAIP adressing scheme. Typically follows `eip155:<chainId>:<protocolName>:<address>`. The protocol either needs to be protocol provided by OpenIbex or a custom protocol, which is implemented and registered via plugin system. Note that the chainId needs to be specified in config.yaml.',    type: String,
    example: "eip155:31337/erc20:0x5FbDB2315678afecb367f032d93F642f64180aa3"
  })
  @IsString()
  artifact: string;

  @ApiProperty({
    description: 'Block number of the first block to get events from.',
    type: Number,
    example: 0
  })
  @IsOptional()
  @IsString()
  startBlock?: number;

}
