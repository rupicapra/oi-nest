import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEthereumAddress, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ExecuteSmartContractDto } from './execute-function.dto';
import { JsonKeystoreDto } from './jsonKeystore.dto';
import { Type } from 'class-transformer';

export class VerifyKeystoreDto {
  @ApiProperty({
    description: 'The Json-KeyStore ',
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
}