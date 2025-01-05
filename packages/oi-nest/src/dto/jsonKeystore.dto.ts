import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  ValidateNested,
  IsIn,
  IsEthereumAddress,
} from 'class-validator';
import { Type } from 'class-transformer';

class CipherParamsDto {
  @ApiProperty({
    description: 'Initialization vector for the cipher',
    example: '7ccf3b26450a89bb001b124956ffb6ce',
    type: String,
  })
  @IsString()
  iv: string;
}

class KdfParamsDto {
  @ApiProperty({
    description: 'Derived key length',
    example: 32,
    type: Number,
  })
  @IsNumber()
  dklen: number;

  @ApiProperty({
    description: 'Salt used for key derivation',
    example: 'dc87093f226b1c536e7c742e904d86f4e3599cdc980058aac54988caa1d47ca2',
    type: String,
  })
  @IsString()
  salt: string;

  @ApiProperty({
    description: 'Work factor for scrypt key derivation',
    example: 131072,
    type: Number,
  })
  @IsNumber()
  n: number;

  @ApiProperty({
    description: 'Block size for scrypt key derivation',
    example: 8,
    type: Number,
  })
  @IsNumber()
  r: number;

  @ApiProperty({
    description: 'Parallelization factor for scrypt key derivation',
    example: 1,
    type: Number,
  })
  @IsNumber()
  p: number;
}

class CryptoDto {
  @ApiProperty({
    description: 'Encrypted ciphertext',
    example: '44747664b48d86c02cd2d7d41780b7578b2953700e6376fa3c350037de0be016',
    type: String,
  })
  @IsString()
  ciphertext: string;

  @ApiProperty({
    description: 'Cipher parameters',
    type: () => CipherParamsDto, // Lazy resolver
  })
  @ValidateNested()
  @Type(() => CipherParamsDto)
  cipherparams: CipherParamsDto;

  @ApiProperty({
    description: 'Cipher algorithm used for encryption',
    example: 'aes-128-ctr',
    type: String,
  })
  @IsString()
  @IsIn(['aes-128-ctr']) // Restrict to valid cipher algorithms
  cipher: string;

  @ApiProperty({
    description: 'Key derivation function used',
    example: 'scrypt',
    type: String,
  })
  @IsString()
  @IsIn(['scrypt']) // Restrict to valid KDF algorithms
  kdf: string;

  @ApiProperty({
    description: 'Parameters for key derivation function',
    type: () => KdfParamsDto, // Lazy resolver
  })
  @ValidateNested()
  @Type(() => KdfParamsDto)
  kdfparams: KdfParamsDto;

  @ApiProperty({
    description: 'Message authentication code (MAC)',
    example: '3c5cb8f993ea0b43dce7a8b32ba3e1b890af5d8ff14733e7f46b14594b7bd542',
    type: String,
  })
  @IsString()
  mac: string;
}

export class JsonKeystoreDto {
  @ApiProperty({
    description: 'Keystore version',
    example: 3,
    type: Number,
  })
  @IsNumber()
  version: number;

  @ApiProperty({
    description: 'Unique identifier for the keystore',
    example: '7cff7009-683b-4d9d-b525-f3ef1b651af8',
    type: String,
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Ethereum address associated with the keystore',
    example: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    type: String, // Use String here, `IsEthereumAddress` is a validation decorator
  })
  @IsEthereumAddress()
  address: string;

  @ApiProperty({
    description: 'Crypto details for the keystore',
    type: () => CryptoDto, // Lazy resolver
  })
  @ValidateNested()
  @Type(() => CryptoDto)
  crypto: CryptoDto;
}
