import { IsEmail, IsNotEmpty, IsString, Length, Min } from 'class-validator';

export class LoginDto {
	@IsEmail()
	email: string;
  
	@IsString()
	@IsNotEmpty()
	@Length(1,20)
	password: string;
}

export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	@Length(1,20)
	nickname: string;

	@IsEmail()
	email: string;
  
	@IsString()
	@IsNotEmpty()
	password: string;
	
	@IsString()
	img : string;
}