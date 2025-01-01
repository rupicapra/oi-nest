import { ApiProperty } from '@nestjs/swagger';
import {  IsString } from 'class-validator';


export class GenerateKeystoreDto {
  @ApiProperty({
    description: 'The private key of the wallet (examle is the hardhat private key of Account #0 - do NOT use in production!!',
    type: String,
    example: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  })
  @IsString()
  private_key: string;

  @ApiProperty({
    description: 'The password for the keystore file',
    type: String,
    example: "supersecret"
  })
  @IsString()
  password: string;
}
