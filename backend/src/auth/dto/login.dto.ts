import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string; // email do distribuidor

  @IsString()
  password: string;
}
